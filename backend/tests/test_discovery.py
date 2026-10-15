from pathlib import Path
from app.scanner.discovery import parse_requirement_line, scan_declared_dependencies
from app.scanner.package_mappings import normalize_package_name, map_import_to_package

def test_parse_requirement_line():
    assert parse_requirement_line("requests==2.28.1") == ("requests", "==2.28.1")
    assert parse_requirement_line("flask >= 2.0.0, < 3.0.0") == ("flask", ">= 2.0.0, < 3.0.0")
    assert parse_requirement_line("pytest # test framework") == ("pytest", "")
    assert parse_requirement_line("# whole line comment") is None
    assert parse_requirement_line("-r other_reqs.txt") is None
    assert parse_requirement_line("uvicorn[standard]>=0.20") == ("uvicorn", ">=0.20")

def test_package_normalization():
    assert normalize_package_name("PyYAML") == "pyyaml"
    assert normalize_package_name("docker_py") == "docker-py"
    assert normalize_package_name("zope.interface") == "zope-interface"

def test_map_import_to_package():
    assert map_import_to_package("yaml") == "pyyaml"
    assert map_import_to_package("PIL") == "pillow"
    assert map_import_to_package("bs4") == "beautifulsoup4"
    assert map_import_to_package("requests") == "requests"

def test_scan_declared_dependencies_fixture():
    fixture_dir = Path(__file__).parent / "fixtures" / "sample_project"
    deps = scan_declared_dependencies(fixture_dir)
    
    assert "requests" in deps
    assert "pyyaml" in deps
    assert "unused-pkg" in deps
    assert deps["requests"].version_spec == "==2.20.0"
    assert deps["pyyaml"].version_spec == "==5.3.1"
