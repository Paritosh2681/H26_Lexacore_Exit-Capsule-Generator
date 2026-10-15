import pytest
from pathlib import Path
from app.core.security import validate_safe_path, redact_secrets, execute_isolated_command
from app.core.exceptions import PathSecurityError

def test_path_traversal_prevention(tmp_path):
    base_dir = tmp_path / "base"
    base_dir.mkdir()
    
    # Safe path
    safe = validate_safe_path(base_dir, "subdir/file.py")
    assert safe == (base_dir / "subdir" / "file.py").resolve()

    # Traversal attack
    with pytest.raises(PathSecurityError):
        validate_safe_path(base_dir, "../secret.txt")

    with pytest.raises(PathSecurityError):
        validate_safe_path(base_dir, "../../etc/passwd")

def test_secret_redaction():
    text = "Error with api_key: 'sk-1234567890abcdef12345678' and Authorization: Bearer eyJhbGciOiJIUzI1NiJ9"
    redacted = redact_secrets(text)
    assert "sk-1234567890abcdef12345678" not in redacted
    assert "[REDACTED_SECRET]" in redacted

def test_execute_isolated_command_timeout(tmp_path):
    # Command that sleeps longer than timeout
    code, stdout, stderr, elapsed = execute_isolated_command(
        ["python", "-c", "import time; time.sleep(5)"],
        cwd=tmp_path,
        timeout=1
    )
    assert code == -1
    assert "timed out" in stderr.lower()

def test_execute_isolated_command_success(tmp_path):
    code, stdout, stderr, elapsed = execute_isolated_command(
        ["python", "-c", "print('hello_sandbox')"],
        cwd=tmp_path,
        timeout=5
    )
    assert code == 0
    assert "hello_sandbox" in stdout.strip()
    assert elapsed > 0
