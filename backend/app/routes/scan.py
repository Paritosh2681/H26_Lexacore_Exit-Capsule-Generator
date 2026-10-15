import os
import uuid
import time
import json
import shutil
import asyncio
import subprocess
from pathlib import Path
from typing import Dict, Any, List
from fastapi import APIRouter, HTTPException, BackgroundTasks
from app.config import settings
from app.database import get_db_connection
from app.models.schemas import StartScanRequest, StartScanResponse, ScanProgressResponse
from app.core.security import is_safe_repo_path
from app.scanner.discovery import scan_declared_dependencies
from app.scanner.ast_analyzer import analyze_repository_ast
from app.metadata.pypi_client import fetch_pypi_metadata
from app.metadata.risk_scorer import calculate_risk_score
from app.ai.gemma_client import GemmaClient
from app.capsule.generator import assemble_and_save_capsule

router = APIRouter(prefix="/api/scans", tags=["Scans"])

# In-memory progress tracking
SCAN_PROGRESS: Dict[str, Dict[str, Any]] = {}

def execute_scan_pipeline(scan_id: str, repo_path_str: str, run_ai: bool, custom_mappings: Dict[str, str] = None):
    """Background worker executing the complete scan pipeline."""
    repo = Path(repo_path_str).resolve()
    
    def update_progress(step: str, pct: int):
        SCAN_PROGRESS[scan_id] = {
            "status": "scanning",
            "progress_pct": pct,
            "current_step": step,
            "error_message": None
        }

    try:
        update_progress("1/5: Discovering declared dependencies...", 15)
        declared_deps = scan_declared_dependencies(repo)

        update_progress("2/5: Performing static AST code usage analysis...", 35)
        usages_by_pkg, observed_pkgs, syntax_errors = analyze_repository_ast(repo)

        update_progress("3/5: Querying package metadata & calculating risk scores...", 60)
        all_pkg_names = set(declared_deps.keys()).union(observed_pkgs)
        
        dep_records = []
        with get_db_connection() as conn:
            cursor = conn.cursor()
            
            for pkg in all_pkg_names:
                decl_info = declared_deps.get(pkg)
                is_declared = decl_info is not None
                is_observed = pkg in usages_by_pkg
                
                # Categorization logic
                if is_declared and is_observed:
                    category = decl_info.category
                elif is_declared and not is_observed:
                    category = "candidate_unused"
                elif not is_declared and is_observed:
                    category = "candidate_undeclared"
                else:
                    category = "declared"

                pinned_ver = decl_info.version_spec if decl_info else None
                meta = fetch_pypi_metadata(pkg, pinned_version=pinned_ver)
                risk_report = calculate_risk_score(meta, pinned_version=pinned_ver)
                
                usages = [u.to_dict() for u in usages_by_pkg.get(pkg, [])]

                cursor.execute("""
                    INSERT OR REPLACE INTO dependencies
                    (scan_id, package_name, declared_version, category, risk_score, risk_breakdown_json, pypi_metadata_json, ast_usage_json, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    scan_id,
                    pkg,
                    pinned_ver,
                    category,
                    risk_report.overall_score,
                    json.dumps(risk_report.to_dict()),
                    json.dumps(meta),
                    json.dumps(usages),
                    str(time.time())
                ))
                dep_records.append({
                    "package_name": pkg,
                    "risk_score": risk_report.overall_score,
                    "level": risk_report.level,
                    "category": category,
                    "usages": usages
                })
            conn.commit()

        # Step 4: AI Recommendations if requested
        if run_ai:
            update_progress("4/5: Requesting migration plans from Gemma 4...", 80)
            gemma = GemmaClient()
            configured, msg = gemma.is_configured()
            if configured:
                # Target dependencies with HIGH or CRITICAL risk scores
                high_risk = [d for d in dep_records if d["risk_score"] >= 40.0]
                if not high_risk and dep_records:
                    # If none high, pick the highest risk one
                    high_risk = sorted(dep_records, key=lambda x: x["risk_score"], reverse=True)[:1]

                for target in high_risk[:2]:  # bound AI calls
                    pname = target["package_name"]
                    try:
                        proposal = gemma.plan_migration(
                            package_name=pname,
                            pinned_version=None,
                            risk_summary=f"Risk Score {target['risk_score']} ({target['level']})",
                            ast_usages=target["usages"]
                        )
                        with get_db_connection() as conn:
                            cursor = conn.cursor()
                            cursor.execute("""
                                INSERT OR REPLACE INTO ai_recommendations
                                (scan_id, package_name, candidate_replacement, model_name, recommendation_json, created_at)
                                VALUES (?, ?, ?, ?, ?, ?)
                            """, (
                                scan_id,
                                pname,
                                proposal.candidate_replacement,
                                gemma.model,
                                proposal.json(),
                                str(time.time())
                            ))
                            conn.commit()
                    except Exception:
                        pass
        else:
            update_progress("4/5: Skipping AI migration planning (disabled)...", 80)

        # Step 5: Assemble and save capsule
        update_progress("5/5: Assembling Dependency Exit Capsule...", 95)
        assemble_and_save_capsule(scan_id)

        # Complete
        with get_db_connection() as conn:
            cursor = conn.cursor()
            summary = {
                "total_dependencies": len(all_pkg_names),
                "declared_count": len(declared_deps),
                "syntax_errors": syntax_errors,
                "completed_at": time.time()
            }
            cursor.execute("""
                UPDATE scans SET status = 'completed', summary_json = ? WHERE scan_id = ?
            """, (json.dumps(summary), scan_id))
            conn.commit()

        SCAN_PROGRESS[scan_id] = {
            "status": "completed",
            "progress_pct": 100,
            "current_step": "Scan and capsule generation complete.",
            "error_message": None
        }

    except Exception as e:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE scans SET status = 'failed', error_message = ? WHERE scan_id = ?
            """, (str(e), scan_id))
            conn.commit()
        SCAN_PROGRESS[scan_id] = {
            "status": "failed",
            "progress_pct": 100,
            "current_step": f"Scan failed: {str(e)}",
            "error_message": str(e)
        }

@router.post("/start", response_model=StartScanResponse)
def start_scan(req: StartScanRequest, background_tasks: BackgroundTasks):
    """Start scanning a local repository or remote GitHub repository URL."""
    target_repo = req.repo_path.strip()
    is_git_url = any(target_repo.startswith(p) for p in ("http://", "https://", "git@", "github.com"))
    
    if is_git_url:
        if not target_repo.startswith("http") and not target_repo.startswith("git@"):
            target_repo = "https://" + target_repo
        
        parts = target_repo.rstrip("/").replace(".git", "").split("/")
        repo_name = f"{parts[-2]}_{parts[-1]}" if len(parts) >= 2 else parts[-1]
        workspace_dir = Path(settings.TEMP_WORKSPACES_DIR) / f"git_{repo_name}"
        
        # Check if already cloned, otherwise clone now
        if not workspace_dir.exists() or not (workspace_dir / ".git").exists():
            workspace_dir.mkdir(parents=True, exist_ok=True)
            try:
                cmd = ["git", "clone", "--depth", "1", target_repo, str(workspace_dir)]
                proc = subprocess.run(cmd, capture_output=True, text=True, timeout=90)
                if proc.returncode != 0:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Failed to clone repository from '{target_repo}': {proc.stderr[:200]}"
                    )
            except HTTPException:
                raise
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Git clone error: {str(e)}")
        
        actual_path = str(workspace_dir.resolve())
    else:
        if not is_safe_repo_path(target_repo):
            raise HTTPException(status_code=400, detail=f"Invalid repository directory: {req.repo_path}")
        actual_path = str(Path(target_repo).resolve())

    scan_id = f"scan_{time.strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:6]}"
    
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO scans (scan_id, repo_path, status, created_at)
            VALUES (?, ?, 'scanning', ?)
        """, (scan_id, req.repo_path, str(time.time())))
        conn.commit()

    SCAN_PROGRESS[scan_id] = {
        "status": "scanning",
        "progress_pct": 5,
        "current_step": "Initializing scan pipeline...",
        "error_message": None
    }

    background_tasks.add_task(
        execute_scan_pipeline,
        scan_id=scan_id,
        repo_path_str=actual_path,
        run_ai=req.run_ai,
        custom_mappings=req.custom_mappings
    )

    return StartScanResponse(
        scan_id=scan_id,
        status="scanning",
        repo_path=req.repo_path,
        message="Scan initiated successfully."
    )

@router.get("/{scan_id}/progress", response_model=ScanProgressResponse)
def get_scan_progress(scan_id: str):
    """Get the current progress of an active scan."""
    if scan_id in SCAN_PROGRESS:
        prog = SCAN_PROGRESS[scan_id]
        return ScanProgressResponse(
            scan_id=scan_id,
            status=prog["status"],
            progress_pct=prog["progress_pct"],
            current_step=prog["current_step"],
            error_message=prog.get("error_message")
        )
    
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT status, error_message FROM scans WHERE scan_id = ?", (scan_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Scan not found")
        
        status = row["status"]
        pct = 100 if status in ["completed", "failed"] else 50
        return ScanProgressResponse(
            scan_id=scan_id,
            status=status,
            progress_pct=pct,
            current_step=f"Status: {status}",
            error_message=row["error_message"]
        )

@router.get("/")
def list_scans():
    """List all previous scans."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM scans ORDER BY created_at DESC")
        rows = cursor.fetchall()
        
        result = []
        for r in rows:
            summary = json.loads(r["summary_json"]) if r["summary_json"] else {}
            result.append({
                "scan_id": r["scan_id"],
                "repo_path": r["repo_path"],
                "status": r["status"],
                "created_at": r["created_at"],
                "summary": summary,
                "error_message": r["error_message"]
            })
        return result

@router.get("/{scan_id}")
def get_scan_details(scan_id: str):
    """Get comprehensive details and dependency list for a completed scan."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM scans WHERE scan_id = ?", (scan_id,))
        scan_row = cursor.fetchone()
        if not scan_row:
            raise HTTPException(status_code=404, detail="Scan not found")

        cursor.execute("SELECT * FROM dependencies WHERE scan_id = ? ORDER BY risk_score DESC", (scan_id,))
        dep_rows = cursor.fetchall()

        dependencies = []
        for d in dep_rows:
            risk = json.loads(d["risk_breakdown_json"]) if d["risk_breakdown_json"] else {}
            meta = json.loads(d["pypi_metadata_json"]) if d["pypi_metadata_json"] else {}
            usages = json.loads(d["ast_usage_json"]) if d["ast_usage_json"] else []

            dependencies.append({
                "package_name": d["package_name"],
                "declared_version": d["declared_version"],
                "category": d["category"],
                "risk_score": d["risk_score"],
                "risk_breakdown": risk,
                "pypi_metadata": meta,
                "usages_count": len(usages)
            })

        return {
            "scan_id": scan_row["scan_id"],
            "repo_path": scan_row["repo_path"],
            "status": scan_row["status"],
            "created_at": scan_row["created_at"],
            "summary": json.loads(scan_row["summary_json"]) if scan_row["summary_json"] else {},
            "dependencies": dependencies
        }

@router.delete("/{scan_id}")
def delete_scan(scan_id: str):
    """Delete a scan and remove associated generated capsules and temporary files."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM scans WHERE scan_id = ?", (scan_id,))
        cursor.execute("DELETE FROM dependencies WHERE scan_id = ?", (scan_id,))
        cursor.execute("DELETE FROM ai_recommendations WHERE scan_id = ?", (scan_id,))
        cursor.execute("DELETE FROM verification_runs WHERE scan_id = ?", (scan_id,))
        cursor.execute("DELETE FROM approval_decisions WHERE scan_id = ?", (scan_id,))
        cursor.execute("DELETE FROM capsules WHERE scan_id = ?", (scan_id,))
        cursor.execute("DELETE FROM implementation_plans WHERE scan_id = ?", (scan_id,))
        cursor.execute("DELETE FROM post_verifications WHERE scan_id = ?", (scan_id,))
        conn.commit()

    # Clean capsule folder
    capsule_dir = Path(settings.CAPSULES_DIR) / scan_id
    if capsule_dir.exists():
        shutil.rmtree(str(capsule_dir), ignore_errors=True)

    return {"message": f"Scan {scan_id} and associated artifacts deleted successfully."}
