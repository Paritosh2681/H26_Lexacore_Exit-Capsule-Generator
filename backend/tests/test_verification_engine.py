from pathlib import Path
from app.verification.engine import run_verification_pipeline
from app.verification.api_compat import compare_api_usage
from app.verification.test_runner import parse_test_results

def test_api_compatibility_check():
    observed = {"get", "post", "delete"}
    candidate = {"get", "post", "delete", "put", "patch"}
    comp = compare_api_usage(observed, candidate)
    assert comp["compatible"] is True
    assert comp["coverage_pct"] == 100.0
    assert len(comp["missing_symbols"]) == 0

    # Missing symbol case
    observed_missing = {"get", "custom_session_handler"}
    comp_miss = compare_api_usage(observed_missing, candidate)
    assert comp_miss["compatible"] is False
    assert "custom_session_handler" in comp_miss["missing_symbols"]

def test_parse_test_results():
    stdout = "test_app.py::test_parse_yaml PASSED\ntest_app.py::test_client PASSED\n\n== 2 passed in 0.12s =="
    res = parse_test_results(stdout, "", 0)
    assert res["success"] is True
    assert res["passed_count"] == 2
    assert res["failed_count"] == 0

def test_verification_pipeline_unit():
    fixture_dir = Path(__file__).parent / "fixtures" / "sample_project"
    ast_usages = [
        {"referenced_symbol": "get", "call_expression": "requests.get()"}
    ]
    # Run with run_live_tests=False to run deterministic static verification steps
    report = run_verification_pipeline(
        repo_path=fixture_dir,
        original_package="requests",
        candidate_package="httpx",
        ast_usages=ast_usages,
        run_live_tests=False
    )
    assert len(report.checks) == 10
    # Candidate package exists check should be PASS or reflect real PyPI check
    chk1 = report.checks[0]
    assert chk1.status in ["PASS", "FAIL"]
    assert report.confidence_score >= 0.0
