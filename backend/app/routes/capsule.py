import json
from pathlib import Path
from fastapi import APIRouter, HTTPException, Response
from fastapi.responses import FileResponse
from app.database import get_db_connection

router = APIRouter(prefix="/api/scans", tags=["Capsule"])

@router.get("/{scan_id}/capsule")
def get_capsule_data(scan_id: str):
    """Retrieve the generated Dependency Exit Capsule data and preview."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM capsules WHERE scan_id = ?", (scan_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail=f"No capsule generated yet for scan '{scan_id}'")

        json_path = Path(row["capsule_json_path"])
        md_path = Path(row["capsule_md_path"])

        if not json_path.exists() or not md_path.exists():
            raise HTTPException(status_code=404, detail="Capsule files missing on disk.")

        capsule_json = json.loads(json_path.read_text(encoding="utf-8"))
        capsule_md = md_path.read_text(encoding="utf-8")

        return {
            "scan_id": scan_id,
            "created_at": row["created_at"],
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
        if not row or not Path(row["capsule_json_path"]).exists():
            raise HTTPException(status_code=404, detail="Capsule JSON not found.")
        return FileResponse(
            path=row["capsule_json_path"],
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
        if not row or not Path(row["capsule_md_path"]).exists():
            raise HTTPException(status_code=404, detail="Capsule Markdown not found.")
        return FileResponse(
            path=row["capsule_md_path"],
            filename="capsule.md",
            media_type="text/markdown"
        )
