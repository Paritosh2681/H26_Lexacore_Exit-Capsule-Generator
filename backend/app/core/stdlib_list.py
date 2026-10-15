import sys

# sys.stdlib_module_names is available in Python 3.10+
if hasattr(sys, "stdlib_module_names"):
    STDLIB_MODULES = set(sys.stdlib_module_names)
else:
    # Comprehensive fallback for standard library modules
    STDLIB_MODULES = {
        "abc", "argparse", "array", "ast", "asyncio", "base64", "binascii",
        "bisect", "builtins", "calendar", "cmath", "collections", "contextlib",
        "copy", "csv", "ctypes", "datetime", "decimal", "difflib", "dis",
        "email", "enum", "errno", "faulthandler", "fcntl", "filecmp", "fileinput",
        "fnmatch", "fractions", "functools", "gc", "getopt", "getpass", "gettext",
        "glob", "graphlib", "gzip", "hashlib", "heapq", "hmac", "html", "http",
        "imaplib", "importlib", "inspect", "io", "ipaddress", "itertools", "json",
        "logging", "lzma", "math", "mimetypes", "mmap", "multiprocessing", "netrc",
        "numbers", "operator", "os", "pathlib", "pickle", "pkgutil", "platform",
        "plistlib", "poplib", "posix", "pprint", "profile", "pstats", "py_compile",
        "queue", "quopri", "random", "re", "readline", "resource", "sched",
        "secrets", "select", "selectors", "shelve", "shlex", "shutil", "signal",
        "site", "smtplib", "socket", "socketserver", "sqlite3", "ssl", "stat",
        "statistics", "string", "struct", "subprocess", "sys", "sysconfig",
        "tabnanny", "tarfile", "tempfile", "termios", "textwrap", "threading",
        "time", "timeit", "tkinter", "token", "tokenize", "tomllib", "trace",
        "traceback", "tracemalloc", "tty", "types", "typing", "unicodedata",
        "unittest", "urllib", "uuid", "venv", "warnings", "wave", "weakref",
        "webbrowser", "winreg", "winsound", "wsgiref", "xml", "xmlrpc", "zipfile",
        "zipimport", "zlib", "_thread"
    }

def is_stdlib_module(name: str) -> bool:
    """Check if a top-level module name belongs to Python standard library."""
    if not name:
        return False
    top_module = name.split(".")[0]
    return top_module in STDLIB_MODULES
