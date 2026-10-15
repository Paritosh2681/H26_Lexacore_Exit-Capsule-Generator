import os
import sys
import venv
import shutil
import tempfile
from pathlib import Path
from typing import Tuple, Optional, Dict
from app.core.security import execute_isolated_command
from app.config import settings

class IsolatedEnvironment:
    """
    Manages an ephemeral isolated Python virtual environment for safe installation
    and verification checks without polluting or executing in the host environment.
    """
    def __init__(self, prefix: str = "exit_capsule_venv_"):
        self.base_temp_dir = Path(settings.TEMP_WORKSPACES_DIR).resolve()
        self.base_temp_dir.mkdir(parents=True, exist_ok=True)
        self.temp_dir = Path(tempfile.mkdtemp(prefix=prefix, dir=str(self.base_temp_dir)))
        self.venv_dir = self.temp_dir / "venv"
        self._created = False

    def create(self) -> Path:
        """Create a fresh virtual environment."""
        # with_pip=True ensures pip is available
        venv.create(str(self.venv_dir), with_pip=True, clear=True)
        self._created = True
        return self.venv_dir

    def get_python_executable(self) -> Path:
        """Return the python executable inside the isolated venv."""
        if os.name == "nt":
            py_exe = self.venv_dir / "Scripts" / "python.exe"
        else:
            py_exe = self.venv_dir / "bin" / "python"
        return py_exe

    def get_pip_executable(self) -> Path:
        """Return the pip executable inside the isolated venv."""
        if os.name == "nt":
            pip_exe = self.venv_dir / "Scripts" / "pip.exe"
        else:
            pip_exe = self.venv_dir / "bin" / "pip"
        return pip_exe

    def run_command(
        self,
        args: list[str],
        cwd: Optional[Path] = None,
        timeout: int = 60,
        env: Optional[Dict[str, str]] = None
    ) -> Tuple[int, str, str, float]:
        """Run a command using the isolated environment's Python or tools."""
        work_dir = cwd or self.temp_dir
        return execute_isolated_command(
            cmd=args,
            cwd=work_dir,
            timeout=timeout,
            max_bytes=settings.MAX_COMMAND_OUTPUT_BYTES,
            env=env
        )

    def install_package(self, package_spec: str, timeout: int = 90) -> Tuple[int, str, str, float]:
        """Attempt to pip install a package inside the isolated environment."""
        pip_path = self.get_pip_executable()
        # Use --no-warn-script-location and safe isolation flags
        cmd = [str(pip_path), "install", "--no-input", "--disable-pip-version-check", package_spec]
        return self.run_command(cmd, timeout=timeout)

    def cleanup(self):
        """Safely delete the temporary environment directory."""
        try:
            if self.temp_dir.exists():
                shutil.rmtree(str(self.temp_dir), ignore_errors=True)
        except Exception:
            pass

    def __enter__(self):
        self.create()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.cleanup()
