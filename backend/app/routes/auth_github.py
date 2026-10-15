import uuid
import time
import httpx
import shutil
import subprocess
from pathlib import Path
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException, Header, Query
from pydantic import BaseModel

from app.config import settings
from app.database import get_db_connection
from app.core.security import validate_safe_path
from app.routes.scan import execute_scan_pipeline

router = APIRouter(prefix="/api/auth/github", tags=["github"])

class CallbackRequest(BaseModel):
    code: str
    state: Optional[str] = None

class DisconnectRequest(BaseModel):
    session_id: Optional[str] = None

class CloneAndScanRequest(BaseModel):
    repo_full_name: str
    clone_url: Optional[str] = None
    default_branch: Optional[str] = "main"
    run_ai: bool = False

def get_session_user(session_id: Optional[str]) -> Optional[Dict[str, Any]]:
    """Retrieve session user and access token from database."""
    if not session_id:
        return None
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM github_sessions WHERE session_id = ?", (session_id,))
        row = cursor.fetchone()
        if row:
            return dict(row)
    return None

@router.get("/status")
def get_github_status(x_session_id: Optional[str] = Header(None, alias="X-Session-ID")):
    """Check whether GitHub OAuth is configured and whether active session exists."""
    is_configured = bool(settings.GITHUB_CLIENT_ID and settings.GITHUB_CLIENT_SECRET)
    session_data = get_session_user(x_session_id)
    
    return {
        "configured": is_configured,
        "connected": bool(session_data),
        "user": {
            "username": session_data["username"],
            "name": session_data["name"],
            "avatar_url": session_data["avatar_url"]
        } if session_data else None,
        "message": "GitHub OAuth ready." if is_configured else "GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET not configured in .env."
    }

@router.get("/login")
def get_github_login_url():
    """Generate GitHub OAuth authorization URL."""
    if not settings.GITHUB_CLIENT_ID:
        raise HTTPException(
            status_code=400,
            detail="GitHub OAuth is not configured on the server. Please add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to .env."
        )
    state = str(uuid.uuid4())
    scope = "repo,read:user"
    auth_url = (
        f"https://github.com/login/oauth/authorize"
        f"?client_id={settings.GITHUB_CLIENT_ID}"
        f"&redirect_uri={settings.GITHUB_REDIRECT_URI}"
        f"&scope={scope}"
        f"&state={state}"
    )
    return {"auth_url": auth_url, "state": state}

from fastapi.responses import RedirectResponse

@router.get("/callback")
def handle_github_callback_get(code: str = Query(...), state: Optional[str] = Query(None)):
    """Handle GET redirect from GitHub OAuth and forward to frontend with authorization code."""
    redirect_url = f"http://localhost:5173/auth/callback?code={code}"
    if state:
        redirect_url += f"&state={state}"
    return RedirectResponse(url=redirect_url)

@router.post("/callback")
def handle_github_callback(req: CallbackRequest):
    """Exchange authorization code for access token and establish authenticated session."""
    if not settings.GITHUB_CLIENT_ID or not settings.GITHUB_CLIENT_SECRET:
        raise HTTPException(status_code=400, detail="GitHub OAuth is not configured on server.")

    # 1. Exchange code for access token
    token_url = "https://github.com/login/oauth/access_token"
    payload = {
        "client_id": settings.GITHUB_CLIENT_ID,
        "client_secret": settings.GITHUB_CLIENT_SECRET,
        "code": req.code,
        "redirect_uri": settings.GITHUB_REDIRECT_URI
    }
    headers = {"Accept": "application/json"}

    try:
        with httpx.Client(timeout=15.0) as client:
            resp = client.post(token_url, json=payload, headers=headers)
            if resp.status_code != 200:
                raise HTTPException(status_code=400, detail="Failed to communicate with GitHub token service.")
            token_data = resp.json()
            access_token = token_data.get("access_token")
            if not access_token:
                err_desc = token_data.get("error_description", "No access token returned from GitHub.")
                raise HTTPException(status_code=400, detail=f"GitHub authorization error: {err_desc}")

            # 2. Fetch authenticated user profile
            user_resp = client.get("https://api.github.com/user", headers={
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/vnd.github.v3+json",
                "User-Agent": "Exit-Capsule-Workbench/1.0"
            })
            if user_resp.status_code != 200:
                raise HTTPException(status_code=400, detail="Failed to fetch user profile from GitHub.")
            user_data = user_resp.json()

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"GitHub OAuth error: {str(e)}")

    # 3. Persist session in SQLite
    session_id = str(uuid.uuid4())
    username = user_data.get("login")
    name = user_data.get("name") or username
    avatar_url = user_data.get("avatar_url")

    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT OR REPLACE INTO github_sessions (session_id, access_token, username, name, avatar_url, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (session_id, access_token, username, name, avatar_url, str(time.time())))
        conn.commit()

    return {
        "session_id": session_id,
        "user": {
            "username": username,
            "name": name,
            "avatar_url": avatar_url
        }
    }

@router.post("/disconnect")
def disconnect_github(req: DisconnectRequest, x_session_id: Optional[str] = Header(None, alias="X-Session-ID")):
    """Terminate GitHub session and discard server token."""
    sid = req.session_id or x_session_id
    if sid:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM github_sessions WHERE session_id = ?", (sid,))
            conn.commit()
    return {"status": "DISCONNECTED", "message": "GitHub session terminated."}

@router.get("/repos")
def list_github_repositories(
    x_session_id: Optional[str] = Header(None, alias="X-Session-ID"),
    search: Optional[str] = Query(None)
):
    """List accessible repositories for authenticated GitHub user."""
    session_data = get_session_user(x_session_id)
    if not session_data:
        raise HTTPException(status_code=401, detail="Active GitHub session required.")

    token = session_data["access_token"]
    url = "https://api.github.com/user/repos?per_page=100&sort=updated"

    try:
        with httpx.Client(timeout=20.0) as client:
            resp = client.get(url, headers={
                "Authorization": f"Bearer {token}",
                "Accept": "application/vnd.github.v3+json",
                "User-Agent": "Exit-Capsule-Workbench/1.0"
            })
            if resp.status_code == 401:
                raise HTTPException(status_code=401, detail="GitHub access token expired or revoked.")
            if resp.status_code != 200:
                raise HTTPException(status_code=resp.status_code, detail="Failed to fetch repositories from GitHub.")
            
            raw_repos = resp.json()
            repos = []
            for r in raw_repos:
                if search and search.lower() not in r.get("name", "").lower() and search.lower() not in r.get("full_name", "").lower():
                    continue
                repos.append({
                    "id": r["id"],
                    "name": r["name"],
                    "full_name": r["full_name"],
                    "private": r["private"],
                    "html_url": r["html_url"],
                    "clone_url": r["clone_url"],
                    "description": r.get("description") or "No description provided",
                    "default_branch": r.get("default_branch") or "main",
                    "language": r.get("language") or "Python",
                    "updated_at": r.get("updated_at")
                })
            return repos
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to query GitHub repositories: {str(e)}")

@router.post("/clone-and-scan")
def clone_and_scan_github_repo(
    req: CloneAndScanRequest,
    x_session_id: Optional[str] = Header(None, alias="X-Session-ID")
):
    """Clone a GitHub repository into isolated workspace and initiate Exit Capsule analysis."""
    session_data = get_session_user(x_session_id)
    
    # Authenticate clone url if session is active
    clone_url = req.clone_url
    if not clone_url:
        clone_url = f"https://github.com/{req.repo_full_name}.git"

    if session_data and session_data.get("access_token"):
        # Insert token into clone url for private repository access: https://x-access-token:<token>@github.com/...
        token = session_data["access_token"]
        clone_url = clone_url.replace("https://", f"https://x-access-token:{token}@")

    clean_name = req.repo_full_name.replace("/", "_").replace("\\", "_")
    target_dir = Path(settings.TEMP_WORKSPACES_DIR) / f"gh_{clean_name}_{int(time.time())}"
    target_dir.parent.mkdir(parents=True, exist_ok=True)

    try:
        # Clone with depth 1
        res = subprocess.run(
            ["git", "clone", "--depth", "1", "--branch", req.default_branch or "main", clone_url, str(target_dir)],
            capture_output=True,
            text=True,
            timeout=60
        )
        if res.returncode != 0:
            # Fallback clone without explicit branch
            res = subprocess.run(
                ["git", "clone", "--depth", "1", clone_url, str(target_dir)],
                capture_output=True,
                text=True,
                timeout=60
            )
            if res.returncode != 0:
                raise HTTPException(status_code=400, detail=f"Failed to clone GitHub repository: {res.stderr[:200]}")

        # Scan repository via existing pipeline
        scan_id = f"gh_{uuid.uuid4().hex[:8]}"
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO scans (scan_id, repo_path, status, created_at)
                VALUES (?, ?, ?, ?)
            """, (scan_id, str(target_dir.resolve()), "QUEUED", str(time.time())))
            conn.commit()

        # Execute scan
        import threading
        thread = threading.Thread(
            target=execute_scan_pipeline,
            args=(scan_id, str(target_dir.resolve()), req.run_ai, {})
        )
        thread.daemon = True
        thread.start()

        return {
            "scan_id": scan_id,
            "status": "QUEUED",
            "message": f"Successfully cloned {req.repo_full_name} and started analysis."
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error initiating GitHub scan: {str(e)}")
