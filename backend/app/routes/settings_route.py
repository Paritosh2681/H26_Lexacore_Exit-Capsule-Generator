import os
from fastapi import APIRouter
from app.config import settings
from app.ai.gemma_client import GemmaClient

router = APIRouter(prefix="/api", tags=["Settings"])

@router.get("/health")
def health_check():
    """Service health and uptime endpoint."""
    return {
        "status": "healthy",
        "service": "Exit Capsule Generator API",
        "version": "1.0.0"
    }

@router.get("/settings")
def get_system_settings():
    """
    Get system and AI provider configuration status.
    Security: NEVER returns raw API keys or passwords.
    """
    gemma = GemmaClient()
    is_configured, status_msg = gemma.is_configured()

    has_key = bool(settings.GEMMA_API_KEY and len(settings.GEMMA_API_KEY) > 4)
    masked_key = f"{settings.GEMMA_API_KEY[:3]}...{settings.GEMMA_API_KEY[-3:]}" if has_key else "NOT_SET"

    return {
        "ai_provider": {
            "configured": is_configured,
            "status_message": status_msg,
            "model": settings.GEMMA_MODEL,
            "base_url": settings.GEMMA_API_BASE_URL,
            "api_key_status": masked_key,
            "remote_inference_enabled": settings.ENABLE_REMOTE_INFERENCE
        },
        "execution_limits": {
            "command_timeout_seconds": settings.COMMAND_TIMEOUT_SECONDS,
            "max_command_output_bytes": settings.MAX_COMMAND_OUTPUT_BYTES,
            "max_source_snippet_lines": settings.MAX_SOURCE_SNIPPET_LINES
        },
        "storage": {
            "database_path": settings.DATABASE_PATH,
            "capsules_dir": settings.CAPSULES_DIR,
            "temp_workspaces_dir": settings.TEMP_WORKSPACES_DIR
        }
    }
