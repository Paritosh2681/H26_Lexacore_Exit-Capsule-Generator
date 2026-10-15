import os
from pathlib import Path
from pydantic import BaseSettings, Field

class Settings(BaseSettings):
    # AI Provider Settings
    GEMMA_API_KEY: str = Field(default="", env="GEMMA_API_KEY")
    GEMMA_API_BASE_URL: str = Field(default="https://api.together.xyz/v1", env="GEMMA_API_BASE_URL")
    GEMMA_MODEL: str = Field(default="google/gemma-4-27b-it", env="GEMMA_MODEL")
    ENABLE_REMOTE_INFERENCE: bool = Field(default=False, env="ENABLE_REMOTE_INFERENCE")

    # Security & Execution Limits
    COMMAND_TIMEOUT_SECONDS: int = Field(default=120, env="COMMAND_TIMEOUT_SECONDS")
    MAX_COMMAND_OUTPUT_BYTES: int = Field(default=524288, env="MAX_COMMAND_OUTPUT_BYTES")  # 512 KB
    MAX_SOURCE_SNIPPET_LINES: int = Field(default=80, env="MAX_SOURCE_SNIPPET_LINES")

    # Storage Paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    DATABASE_PATH: str = Field(default="exit_capsule.db", env="DATABASE_PATH")
    CAPSULES_DIR: str = Field(default="generated_capsules", env="CAPSULES_DIR")
    TEMP_WORKSPACES_DIR: str = Field(default="temp_workspaces", env="TEMP_WORKSPACES_DIR")

    # Server Settings
    BACKEND_HOST: str = Field(default="127.0.0.1", env="BACKEND_HOST")
    BACKEND_PORT: int = Field(default=8000, env="BACKEND_PORT")

    class Config:
        env_file = (".env", "../.env")
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()

# Ensure directories exist
os.makedirs(settings.CAPSULES_DIR, exist_ok=True)
os.makedirs(settings.TEMP_WORKSPACES_DIR, exist_ok=True)
