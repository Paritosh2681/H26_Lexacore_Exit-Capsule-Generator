import os
import re
import shutil
import tempfile
from pathlib import Path
from typing import Dict, Any, Optional, Tuple
from app.core.security import execute_isolated_command
from app.config import settings

def detect_test_command(repo_path: Path) -> Tuple[str, list[str]]:
    """
    Detect whether repository uses pytest or standard unittest.
    Returns (framework_name, command_arguments_relative_to_python).
    """
    has_pytest_config = (
        (repo_path / "pytest.ini").exists() or
        (repo_path / "setup.cfg").exists() or
        (repo_path / "pyproject.toml").exists()
    )
    tests_dir = repo_path / "tests"
    has_tests_dir = tests_dir.exists() and tests_dir.is_dir()
    
    # Check for test_*.py or *_test.py in tests directory or root
    has_test_files = False
    if has_tests_dir:
        has_test_files = bool(list(tests_dir.glob("test_*.py")) or list(tests_dir.glob("*_test.py")))
    if not has_test_files:
        has_test_files = bool(list(repo_path.glob("test_*.py")) or list(repo_path.glob("*_test.py")))

    if not has_test_files and not has_pytest_config:
        return "none_detected", ["-c", "print('No test suite detected')"]

    if has_pytest_config or has_tests_dir:
        return "pytest", ["-m", "pytest", "-v"]
    
    return "unittest", ["-m", "unittest", "discover", "-s", ".", "-p", "test_*.py"]

def parse_test_results(stdout: str, stderr: str, exit_code: int) -> Dict[str, Any]:
    """Parse test runner output to extract passed, failed, errors, skipped counts."""
    combined = stdout + "\n" + stderr
    
    passed = 0
    failed = 0
    errors = 0
    skipped = 0

    p_match = re.search(r"(\d+)\s+passed", combined)
    f_match = re.search(r"(\d+)\s+failed", combined)
    s_match = re.search(r"(\d+)\s+skipped", combined)
    e_match = re.search(r"(\d+)\s+error", combined)

    if p_match or f_match or s_match or e_match:
        passed = int(p_match.group(1)) if p_match else 0
        failed = int(f_match.group(1)) if f_match else 0
        skipped = int(s_match.group(1)) if s_match else 0
        errors = int(e_match.group(1)) if e_match else 0
    else:
        # Match unittest summary e.g. "Ran 5 tests in 0.002s\n\nOK" or "FAILED (failures=1, errors=1)"
        ran_match = re.search(r"Ran (\d+) tests?", combined)
        total_ran = int(ran_match.group(1)) if ran_match else 0
        if "OK" in combined:
            passed = total_ran
        else:
            fail_match = re.search(r"failures=(\d+)", combined)
            err_match = re.search(r"errors=(\d+)", combined)
            failed = int(fail_match.group(1)) if fail_match else (1 if exit_code != 0 else 0)
            errors = int(err_match.group(1)) if err_match else 0
            passed = max(0, total_ran - failed - errors)

    return {
        "exit_code": exit_code,
        "success": exit_code == 0,
        "passed_count": passed,
        "failed_count": failed,
        "error_count": errors,
        "skipped_count": skipped,
        "total_count": passed + failed + errors + skipped
    }

class IsolatedRepositoryCopy:
    """Creates a temporary working copy of a repository for safe test execution and patching."""
    def __init__(self, original_repo: Path | str, prefix: str = "work_copy_"):
        self.original_repo = Path(original_repo).resolve()
        self.base_temp_dir = Path(settings.TEMP_WORKSPACES_DIR).resolve()
        self.base_temp_dir.mkdir(parents=True, exist_ok=True)
        self.temp_dir = Path(tempfile.mkdtemp(prefix=prefix, dir=str(self.base_temp_dir)))
        self.work_copy_path = self.temp_dir / "repo"

    def create(self) -> Path:
        """Copies original repository into temporary directory, excluding .git, venv, caches."""
        def _ignore_patterns(src, names):
            ignored = set()
            for name in names:
                if name in [".git", ".venv", "venv", "node_modules", "build", "dist", "__pycache__", ".pytest_cache", ".eggs"]:
                    ignored.add(name)
            return ignored

        shutil.copytree(str(self.original_repo), str(self.work_copy_path), ignore=_ignore_patterns)
        return self.work_copy_path

    def cleanup(self):
        try:
            if self.temp_dir.exists():
                shutil.rmtree(str(self.temp_dir), ignore_errors=True)
        except Exception:
            pass

    def __enter__(self):
        self.create()
        return self.work_copy_path

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.cleanup()
