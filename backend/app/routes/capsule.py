import json
import time
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, HTTPException, Response
from fastapi.responses import FileResponse
from app.config import settings
from app.database import get_db_connection

router = APIRouter(prefix="/api/scans", tags=["Capsule"])

def _resolve_capsule_file(path_str: Optional[str], scan_id: str, filename: str) -> Optional[Path]:
    """Resolve capsule files safely across relative, absolute, and default locations."""
    if path_str:
        p = Path(path_str)
        if p.is_file():
            return p
        p_base = (settings.BASE_DIR / p).resolve()
        if p_base.is_file():
            return p_base
        p_cwd = (Path.cwd() / p).resolve()
        if p_cwd.is_file():
            return p_cwd

    # Check canonical capsules directory
    p_canonical = (Path(settings.CAPSULES_DIR) / scan_id / filename).resolve()
    if p_canonical.is_file():
        return p_canonical

    p_base_canonical = (settings.BASE_DIR / "generated_capsules" / scan_id / filename).resolve()
    if p_base_canonical.is_file():
        return p_base_canonical

    return None

@router.get("/{scan_id}/capsule")
def get_capsule_data(scan_id: str):
    """Retrieve the generated Dependency Exit Capsule data and preview."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM scans WHERE scan_id = ?", (scan_id,))
        scan_row = cursor.fetchone()
        if not scan_row:
            raise HTTPException(status_code=404, detail=f"Scan '{scan_id}' not found.")

        cursor.execute("SELECT * FROM capsules WHERE scan_id = ?", (scan_id,))
        row = cursor.fetchone()

        json_path = _resolve_capsule_file(row["capsule_json_path"] if row else None, scan_id, "capsule.json")
        md_path = _resolve_capsule_file(row["capsule_md_path"] if row else None, scan_id, "capsule.md")

        if not json_path or not md_path:
            from app.capsule.generator import assemble_and_save_capsule
            try:
                gen_json, gen_md, _ = assemble_and_save_capsule(scan_id)
                json_path = gen_json
                md_path = gen_md
                cursor.execute("SELECT * FROM capsules WHERE scan_id = ?", (scan_id,))
                row = cursor.fetchone()
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Failed to generate capsule for scan '{scan_id}': {str(e)}")

        if not json_path or not json_path.exists() or not md_path or not md_path.exists():
            raise HTTPException(status_code=404, detail=f"Capsule files could not be located on disk for scan '{scan_id}'.")

        try:
            capsule_json = json.loads(json_path.read_text(encoding="utf-8"))
            capsule_md = md_path.read_text(encoding="utf-8")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to read capsule files for '{scan_id}': {str(e)}")

        return {
            "scan_id": scan_id,
            "created_at": row["created_at"] if row else str(time.time()),
            "capsule_data": capsule_json,
            "capsule_markdown": capsule_md,
            "download_json_url": f"/api/scans/{scan_id}/capsule/download/json",
            "download_md_url": f"/api/scans/{scan_id}/capsule/download/md"
        }

@router.get("/{scan_id}/capsule/download/json")
def download_capsule_json(scan_id: str):
    """Download capsule.json file."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT capsule_json_path FROM capsules WHERE scan_id = ?", (scan_id,))
        row = cursor.fetchone()
        json_path = _resolve_capsule_file(row["capsule_json_path"] if row else None, scan_id, "capsule.json")
        
        if not json_path or not json_path.exists():
            from app.capsule.generator import assemble_and_save_capsule
            try:
                json_path, _, _ = assemble_and_save_capsule(scan_id)
            except Exception:
                raise HTTPException(status_code=404, detail="Capsule JSON not found.")

        return FileResponse(
            path=str(json_path),
            filename="capsule.json",
            media_type="application/json"
        )

@router.get("/{scan_id}/capsule/download/md")
def download_capsule_md(scan_id: str):
    """Download capsule.md file."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT capsule_md_path FROM capsules WHERE scan_id = ?", (scan_id,))
        row = cursor.fetchone()
        md_path = _resolve_capsule_file(row["capsule_md_path"] if row else None, scan_id, "capsule.md")

        if not md_path or not md_path.exists():
            from app.capsule.generator import assemble_and_save_capsule
            try:
                _, md_path, _ = assemble_and_save_capsule(scan_id)
            except Exception:
                raise HTTPException(status_code=404, detail="Capsule Markdown not found.")

        return FileResponse(
            path=str(md_path),
            filename="capsule.md",
            media_type="text/markdown"
        )
