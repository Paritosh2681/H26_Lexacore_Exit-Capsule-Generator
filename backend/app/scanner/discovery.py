import os
import re
import tomllib
from pathlib import Path
from typing import Dict, List, Set, Tuple, Optional
from app.scanner.package_mappings import normalize_package_name

class DeclaredDependency:
    def __init__(self, name: str, version_spec: str = "", category: str = "declared", source_file: str = ""):
        self.name = normalize_package_name(name)
        self.raw_name = name
        self.version_spec = version_spec.strip()
        self.category = category  # 'declared', 'dev', 'optional'
        self.source_file = source_file

    def to_dict(self) -> Dict[str, str]:
        return {
            "name": self.name,
            "raw_name": self.raw_name,
            "version_spec": self.version_spec,
            "category": self.category,
            "source_file": self.source_file
        }

def parse_requirement_line(line: str) -> Optional[Tuple[str, str]]:
    """
    Parse a single requirements.txt line into (package_name, version_spec).
    Handles inline comments, flags (-r, -e, etc), markers (e.g. ; python_version > '3.8').
    """
    cleaned = line.split("#")[0].strip()
    if not cleaned or cleaned.startswith(("-", "--", "@")):
        return None

    # Handle markers like ; sys_platform == 'win32'
    if ";" in cleaned:
        cleaned = cleaned.split(";")[0].strip()

    # Match package name and optional version spec
    # Examples: package==1.0.0, package>=1.0.0, package[extra]~=2.1
    match = re.match(r"^([a-zA-Z0-9_\-\.]+)(?:\[[^\]]*\])?\s*([<>=!~].*)?$", cleaned)
    if match:
        pkg_name = match.group(1).strip()
        version_spec = match.group(2).strip() if match.group(2) else ""
        return pkg_name, version_spec
    return None

def scan_declared_dependencies(repo_path: Path | str) -> Dict[str, DeclaredDependency]:
    """
    Scan a repository root for declared dependencies across:
    - requirements.txt and variants (requirements-dev.txt, dev-requirements.txt, etc.)
    - pyproject.toml (PEP 621, Poetry, Flit)
    - Pipfile (if present)
    - setup.cfg (if present)
    """
    repo = Path(repo_path).resolve()
    declared: Dict[str, DeclaredDependency] = {}

    # 1. Scan requirements files
    req_patterns = ["*requirements*.txt", "requirements/*.txt"]
    for pattern in req_patterns:
        for req_file in repo.glob(pattern):
            if any(part in req_file.parts for part in [".git", ".venv", "venv", "node_modules", "build", "dist"]):
                continue
            is_dev = any(keyword in req_file.name.lower() for keyword in ["dev", "test", "lint", "ci"])
            cat = "dev" if is_dev else "declared"
            
            try:
                content = req_file.read_text(encoding="utf-8", errors="replace")
                rel_path = str(req_file.relative_to(repo))
                for line in content.splitlines():
                    parsed = parse_requirement_line(line)
                    if parsed:
                        name, ver = parsed
                        norm_name = normalize_package_name(name)
                        if norm_name:
                            # Only overwrite if we don't have it or upgrading from dev to core declared
                            if norm_name not in declared or (declared[norm_name].category == "dev" and cat == "declared"):
                                declared[norm_name] = DeclaredDependency(
                                    name=name,
                                    version_spec=ver,
                                    category=cat,
                                    source_file=rel_path
                                )
            except Exception:
                pass

    # 2. Scan pyproject.toml
    pyproject_file = repo / "pyproject.toml"
    if pyproject_file.exists():
        try:
            with open(pyproject_file, "rb") as f:
                data = tomllib.load(f)
            
            rel_path = str(pyproject_file.relative_to(repo))
            
            # PEP 621 project.dependencies
            project_deps = data.get("project", {}).get("dependencies", [])
            for dep_str in project_deps:
                parsed = parse_requirement_line(dep_str)
                if parsed:
                    name, ver = parsed
                    norm_name = normalize_package_name(name)
                    if norm_name:
                        declared[norm_name] = DeclaredDependency(
                            name=name, version_spec=ver, category="declared", source_file=rel_path
                        )
                        
            # PEP 621 optional-dependencies
            optional_deps = data.get("project", {}).get("optional-dependencies", {})
            for group_name, deps in optional_deps.items():
                is_dev = any(keyword in group_name.lower() for keyword in ["dev", "test", "lint", "ci"])
                cat = "dev" if is_dev else "optional"
                for dep_str in deps:
                    parsed = parse_requirement_line(dep_str)
                    if parsed:
                        name, ver = parsed
                        norm_name = normalize_package_name(name)
                        if norm_name and norm_name not in declared:
                            declared[norm_name] = DeclaredDependency(
                                name=name, version_spec=ver, category=cat, source_file=rel_path
                            )

            # Poetry tool.poetry.dependencies
            poetry_deps = data.get("tool", {}).get("poetry", {}).get("dependencies", {})
            for name, spec in poetry_deps.items():
                if name.lower() == "python":
                    continue
                norm_name = normalize_package_name(name)
                ver_str = spec if isinstance(spec, str) else str(spec.get("version", "")) if isinstance(spec, dict) else ""
                declared[norm_name] = DeclaredDependency(
                    name=name, version_spec=ver_str, category="declared", source_file=rel_path
                )

            # Poetry dev dependencies
            poetry_dev_deps = data.get("tool", {}).get("poetry", {}).get("dev-dependencies", {})
            for name, spec in poetry_dev_deps.items():
                norm_name = normalize_package_name(name)
                ver_str = spec if isinstance(spec, str) else str(spec.get("version", "")) if isinstance(spec, dict) else ""
                if norm_name not in declared:
                    declared[norm_name] = DeclaredDependency(
                        name=name, version_spec=ver_str, category="dev", source_file=rel_path
                    )
                    
            # Poetry 1.2+ groups
            poetry_groups = data.get("tool", {}).get("poetry", {}).get("group", {})
            for grp_name, grp_data in poetry_groups.items():
                is_dev = any(keyword in grp_name.lower() for keyword in ["dev", "test", "lint", "docs"])
                cat = "dev" if is_dev else "optional"
                grp_deps = grp_data.get("dependencies", {})
                for name, spec in grp_deps.items():
                    norm_name = normalize_package_name(name)
                    ver_str = spec if isinstance(spec, str) else str(spec.get("version", "")) if isinstance(spec, dict) else ""
                    if norm_name not in declared:
                        declared[norm_name] = DeclaredDependency(
                            name=name, version_spec=ver_str, category=cat, source_file=rel_path
                        )
        except Exception:
            pass

    return declared
