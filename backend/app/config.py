import os
from pathlib import Path
from pydantic import Field

try:
    from pydantic import BaseSettings
    _PYDANTIC_V2 = False
except Exception:
    # pydantic v2 moved BaseSettings to the pydantic-settings package
    from pydantic_settings import BaseSettings, SettingsConfigDict
    _PYDANTIC_V2 = True


class Settings(BaseSettings):
    # AI Provider Settings
    GEMMA_API_KEY: str = Field(default="", description="API key for the Gemma 4 provider")
    GEMMA_API_BASE_URL: str = Field(default="https://api.together.xyz/v1", description="Base URL for the AI provider")
    GEMMA_MODEL: str = Field(default="google/gemma-4-27b-it", description="Migration planner model")
    ENABLE_REMOTE_INFERENCE: bool = Field(default=False, description="Enable remote AI inference")

    # GitHub OAuth Settings
    GITHUB_CLIENT_ID: str = Field(default="")
    GITHUB_CLIENT_SECRET: str = Field(default="")
    GITHUB_REDIRECT_URI: str = Field(default="http://localhost:5173/auth/callback")

    # Security & Execution Limits
    COMMAND_TIMEOUT_SECONDS: int = Field(default=120)
    MAX_COMMAND_OUTPUT_BYTES: int = Field(default=524288)  # 512 KB
    MAX_SOURCE_SNIPPET_LINES: int = Field(default=80)

    # Storage Paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    DATABASE_PATH: str = Field(default=str(Path(__file__).resolve().parent.parent / "exit_capsule.db"))
    CAPSULES_DIR: str = Field(default=str(Path(__file__).resolve().parent.parent / "generated_capsules"))
    TEMP_WORKSPACES_DIR: str = Field(default=str(Path(__file__).resolve().parent.parent / "temp_workspaces"))

    # Server Settings
    BACKEND_HOST: str = Field(default="127.0.0.1")
    BACKEND_PORT: int = Field(default=8000)

    if _PYDANTIC_V2:
        model_config = SettingsConfigDict(env_file=(".env", "../.env"), env_file_encoding="utf-8", extra="ignore")
    else:
        class Config:
            env_file = (".env", "../.env")
            env_file_encoding = "utf-8"
            extra = "ignore"


settings = Settings()

# Ensure directories exist
os.makedirs(settings.CAPSULES_DIR, exist_ok=True)
os.makedirs(settings.TEMP_WORKSPACES_DIR, exist_ok=True)
