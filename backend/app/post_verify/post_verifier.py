import os
import difflib
import time
from pathlib import Path
from typing import Dict, Any, List, Optional
from app.scanner.ast_analyzer import analyze_repository_ast
from app.scanner.discovery import scan_declared_dependencies
from app.verification.test_runner import detect_test_command, parse_test_results
from app.core.security import execute_isolated_command

class PostVerificationResult:
    def __init__(
        self,
        scan_id: str,
        working_copy_path: str,
        target_package: str,
        candidate_package: str,
        status: str,  # 'PASSED', 'FAILED', 'PARTIAL'
        diff_summary: str,
        checks: List[Dict[str, Any]],
        report_markdown: str
    ):
        self.scan_id = scan_id
        self.working_copy_path = working_copy_path
        self.target_package = target_package
        self.candidate_package = candidate_package
        self.status = status
        self.diff_summary = diff_summary
        self.checks = checks
        self.report_markdown = report_markdown

    def to_dict(self) -> Dict[str, Any]:
        return {
            "scan_id": self.scan_id,
            "working_copy_path": self.working_copy_path,
            "target_package": self.target_package,
            "candidate_package": self.candidate_package,
            "status": self.status,
            "diff_summary": self.diff_summary,
            "checks": self.checks,
            "report_markdown": self.report_markdown
        }

def compute_directory_diff(original_dir: Path, modified_dir: Path) -> str:
    """Compute text unified diff between two directories for python and config files."""
    diff_lines = []
    for root, _, files in os.walk(modified_dir):
        if any(p in root for p in [".git", ".venv", "venv", "__pycache__", "node_modules"]):
            continue
        for file in files:
            if not file.endswith((".py", ".txt", ".toml", ".cfg", ".md")):
                continue
            mod_file = Path(root) / file
            rel = mod_file.relative_to(modified_dir)
            orig_file = original_dir / rel

            if orig_file.exists():
                orig_text = orig_file.read_text(encoding="utf-8", errors="replace").splitlines()
                mod_text = mod_file.read_text(encoding="utf-8", errors="replace").splitlines()
                delta = list(difflib.unified_diff(
                    orig_text, mod_text,
                    fromfile=f"a/{rel}",
                    tofile=f"b/{rel}",
                    lineterm=""
                ))
                if delta:
                    diff_lines.extend(delta)
            else:
                diff_lines.append(f"New file: b/{rel}")

    return "\n".join(diff_lines)

def run_post_implementation_verification(
    scan_id: str,
    original_repo: Path | str,
    working_copy: Path | str,
    target_package: str,
    candidate_package: str
) -> PostVerificationResult:
    """
    Verify developer changes made in working copy:
    - Compare diff against approved plan
    - Check target dependency was removed
    - Check candidate dependency was added and imported
    - Run test suite
    - Record findings honestly
    """
    orig_path = Path(original_repo).resolve()
    work_path = Path(working_copy).resolve()
    
    checks: List[Dict[str, Any]] = []
    
    # 1. Compute diff
    diff_text = compute_directory_diff(orig_path, work_path)
    
    # 2. Check declared dependencies in working copy
    work_deps = scan_declared_dependencies(work_path)
    target_still_declared = target_package in work_deps
    candidate_declared = candidate_package in work_deps

    if not target_still_declared:
        checks.append({
            "name": f"Remove `{target_package}` from dependencies",
            "status": "PASS",
            "details": f"`{target_package}` is no longer present in dependency manifests."
        })
    else:
        checks.append({
            "name": f"Remove `{target_package}` from dependencies",
            "status": "FAIL",
            "details": f"`{target_package}` is still listed in {work_deps[target_package].source_file}."
        })

    if candidate_declared:
        checks.append({
            "name": f"Add `{candidate_package}` to dependencies",
            "status": "PASS",
            "details": f"`{candidate_package}` is declared in {work_deps[candidate_package].source_file}."
        })
    else:
        checks.append({
            "name": f"Add `{candidate_package}` to dependencies",
            "status": "FAIL",
            "details": f"`{candidate_package}` was not found in any dependency manifests."
        })

    # 3. Check AST imports in working copy
    usages_by_pkg, observed_pkgs, syntax_errors = analyze_repository_ast(work_path)
    target_in_ast = target_package in usages_by_pkg
    candidate_in_ast = candidate_package in usages_by_pkg

    if not target_in_ast:
        checks.append({
            "name": f"Remove `{target_package}` source imports",
            "status": "PASS",
            "details": f"Zero AST imports of `{target_package}` found in source code."
        })
    else:
        checks.append({
            "name": f"Remove `{target_package}` source imports",
            "status": "FAIL",
            "details": f"`{target_package}` is still imported in {len(usages_by_pkg[target_package])} location(s)."
        })

    if candidate_in_ast:
        checks.append({
            "name": f"Verify `{candidate_package}` source imports",
            "status": "PASS",
            "details": f"`{candidate_package}` is actively imported in {len(usages_by_pkg[candidate_package])} location(s)."
        })
    else:
        checks.append({
            "name": f"Verify `{candidate_package}` source imports",
            "status": "INCONCLUSIVE",
            "details": f"No direct imports of `{candidate_package}` detected in Python AST."
        })

    # 4. Run test suite in working copy
    fw_name, test_cmd_args = detect_test_command(work_path)
    test_passed = False
    test_summary: Dict[str, Any] = {}
    if fw_name != "none_detected":
        full_cmd = ["python"] + test_cmd_args
        code, stdout, stderr, elapsed = execute_isolated_command(full_cmd, cwd=work_path)
        test_summary = parse_test_results(stdout, stderr, code)
        test_passed = test_summary["success"]

        if test_passed:
            checks.append({
                "name": "Working Copy Test Suite Execution",
                "status": "PASS",
                "details": f"Ran tests ({test_summary['passed_count']} passed in {elapsed}s)."
            })
        else:
            checks.append({
                "name": "Working Copy Test Suite Execution",
                "status": "FAIL",
                "details": f"Tests failed ({test_summary['failed_count']} failed, {test_summary['error_count']} errors)."
            })
    else:
        checks.append({
            "name": "Working Copy Test Suite Execution",
            "status": "NOT_RUN",
            "details": "No test suite found in working copy."
        })

    # Determine overall status
    has_fail = any(c["status"] == "FAIL" for c in checks)
    all_pass = all(c["status"] == "PASS" for c in checks)
    overall_status = "PASSED" if all_pass else ("FAILED" if has_fail else "PARTIAL")

    # Generate Markdown Report
    report_md = f"""# Post-Implementation Verification Report
**Scan ID:** `{scan_id}`
**Target Migration:** `{target_package}` &rarr; `{candidate_package}`
**Overall Result:** **{overall_status}**

## Verification Checks Summary
| Verification Step | Status | Evidence / Details |
| :--- | :---: | :--- |
"""
    for chk in checks:
        report_md += f"| {chk['name']} | `{chk['status']}` | {chk['details']} |\n"

    report_md += f"\n## Git / Unified Diff Summary\n```diff\n{diff_text or '(No file differences detected)'}\n```\n"

    return PostVerificationResult(
        scan_id=scan_id,
        working_copy_path=str(work_path),
        target_package=target_package,
        candidate_package=candidate_package,
        status=overall_status,
        diff_summary=diff_text,
        checks=checks,
        report_markdown=report_md
    )
