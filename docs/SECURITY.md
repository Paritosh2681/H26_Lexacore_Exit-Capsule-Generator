# Exit Capsule Generator: Security & Sandboxing Model

## 1. Threat Model & Design Principles
Developers often analyze unmaintained, obsolete, or third-party codebases that may contain malicious payloads or unintended execution side effects.

The Exit Capsule Generator adheres to the following strict operational boundaries:

### Rule 1: Static Analysis Never Executes Code
Static repository scanning reads dependency files (`requirements.txt`, `pyproject.toml`) and parses `.py` files using Python's native `ast` module. At no point during scanning is `import` or `exec()` invoked on repository code.

### Rule 2: No Direct Execution in Original Repository
Test suites and commands are **never** executed inside the user's original repository. When verification testing is triggered:
1. An isolated temporary working copy of the repository is copied into `temp_workspaces/`.
2. Ignored folders (`.git`, `.venv`, `node_modules`, caches) are excluded from the copy.
3. Tests run inside the temporary sandbox copy.
4. The temporary directory is wiped upon completion.

### Rule 3: Isolated Virtual Environments
Package installations and candidate verification run inside clean, ephemeral virtual environments (`temp_workspaces/verify_<pkg>_...`) created via Python's standard `venv` library.
> **Sandboxing Disclosure**: Temporary virtual environments provide namespace and filesystem isolation for Python packages, but do not provide kernel-level or hypervisor-level sandboxing against malicious native C extensions.

### Rule 4: Subprocess Execution Safeguards
- Subprocesses are executed strictly with `shell=False`.
- Command arguments are passed as explicit token arrays (`list[str]`), preventing command injection.
- Execution timeouts (default: 120 seconds) prevent runaway processes.
- Output byte limit caps (default: 512 KB) prevent out-of-memory denial-of-service.

### Rule 5: Path Traversal Prevention
All relative file accesses and repository operations are validated with `validate_safe_path()`, resolving paths against trusted roots and rejecting any attempt to navigate out via `..` or symbolic links.

### Rule 6: Secret Redaction
All API keys, Bearer tokens, GitHub tokens, and passwords matching signature patterns are stripped and replaced with `[REDACTED_SECRET]` before logging, persisting in SQLite, or generating markdown capsules.
