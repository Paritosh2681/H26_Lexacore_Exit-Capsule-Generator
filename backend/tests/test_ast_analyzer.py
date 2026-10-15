from pathlib import Path
from app.scanner.ast_analyzer import analyze_repository_ast

def test_ast_analyzer_sample_project():
    fixture_dir = Path(__file__).parent / "fixtures" / "sample_project"
    usages_by_pkg, observed_pkgs, syntax_errors = analyze_repository_ast(fixture_dir)

    assert not syntax_errors
    assert "requests" in observed_pkgs
    assert "pyyaml" in observed_pkgs
    assert "unused-pkg" not in observed_pkgs  # unused-pkg is declared in reqs but never imported in code

    # Check requests usages
    req_usages = usages_by_pkg["requests"]
    assert len(req_usages) >= 2

    # Check calls and bindings
    symbols = {u.referenced_symbol for u in req_usages if u.referenced_symbol}
    assert "get" in symbols or "post" in symbols

    # Check scopes
    scopes = {u.enclosing_scope for u in req_usages if u.enclosing_scope}
    assert any("ServiceClient" in (s or "") for s in scopes)

    # Check YAML usage
    yaml_usages = usages_by_pkg["pyyaml"]
    assert len(yaml_usages) >= 1
    assert any("safe_load" in (u.referenced_symbol or u.call_expression or "") for u in yaml_usages)
