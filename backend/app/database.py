import sqlite3
import json
from pathlib import Path
from typing import Optional, Dict, Any, List
from app.config import settings

def get_db_connection() -> sqlite3.Connection:
    """Get a SQLite connection with dict-like row access."""
    db_path = Path(settings.DATABASE_PATH).resolve()
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize database tables with schema migrations."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Scans table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS scans (
            scan_id TEXT PRIMARY KEY,
            repo_path TEXT NOT NULL,
            status TEXT NOT NULL,
            created_at TEXT NOT NULL,
            summary_json TEXT,
            error_message TEXT
        )
        """)
        
        # Dependencies table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS dependencies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            scan_id TEXT NOT NULL,
            package_name TEXT NOT NULL,
            declared_version TEXT,
            category TEXT NOT NULL,
            risk_score REAL DEFAULT 0.0,
            risk_breakdown_json TEXT,
            pypi_metadata_json TEXT,
            ast_usage_json TEXT,
            created_at TEXT NOT NULL,
            UNIQUE(scan_id, package_name)
        )
        """)
        
        # AI Recommendations table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS ai_recommendations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            scan_id TEXT NOT NULL,
            package_name TEXT NOT NULL,
            candidate_replacement TEXT NOT NULL,
            model_name TEXT NOT NULL,
            recommendation_json TEXT NOT NULL,
            created_at TEXT NOT NULL,
            UNIQUE(scan_id, package_name)
        )
        """)
        
        # Verification runs table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS verification_runs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            scan_id TEXT NOT NULL,
            package_name TEXT NOT NULL,
            check_name TEXT NOT NULL,
            status TEXT NOT NULL,
            evidence TEXT,
            error_details TEXT,
            command_executed TEXT,
            elapsed_seconds REAL DEFAULT 0.0,
            created_at TEXT NOT NULL
        )
        """)
        
        # Approval decisions table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS approval_decisions (
            scan_id TEXT NOT NULL,
            package_name TEXT NOT NULL,
            decision TEXT NOT NULL,
            notes TEXT,
            decided_at TEXT NOT NULL,
            PRIMARY KEY (scan_id, package_name)
        )
        """)
        
        # Capsules table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS capsules (
            scan_id TEXT PRIMARY KEY,
            capsule_json_path TEXT NOT NULL,
            capsule_md_path TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
        """)
        
        # Implementation plans table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS implementation_plans (
            scan_id TEXT NOT NULL,
            package_name TEXT NOT NULL,
            plan_json TEXT NOT NULL,
            plan_md TEXT NOT NULL,
            agent_prompt TEXT NOT NULL,
            created_at TEXT NOT NULL,
            PRIMARY KEY (scan_id, package_name)
        )
        """)
        
        # Post verifications table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS post_verifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            scan_id TEXT NOT NULL,
            working_copy_path TEXT NOT NULL,
            diff_summary TEXT,
            status TEXT NOT NULL,
            checks_json TEXT NOT NULL,
            report_md TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
        """)

        # GitHub sessions table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS github_sessions (
            session_id TEXT PRIMARY KEY,
            access_token TEXT NOT NULL,
            username TEXT,
            name TEXT,
            avatar_url TEXT,
            created_at TEXT NOT NULL
        )
        """)
        
        conn.commit()

# Run DB initialization on import
init_db()
