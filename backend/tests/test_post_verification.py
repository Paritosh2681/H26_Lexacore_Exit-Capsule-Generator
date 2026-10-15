import shutil
from pathlib import Path
from app.post_verify.post_verifier import run_post_implementation_verification, compute_directory_diff

def test_post_verification_workflow(tmp_path):
    orig = tmp_path / "orig"
    orig.mkdir()
    (orig / "requirements.txt").write_text("requests==2.28.0\n", encoding="utf-8")
    (orig / "app.py").write_text("import requests\nprint(requests.get('https://example.com'))\n", encoding="utf-8")

    # Modified working copy where requests is replaced with httpx
    modified = tmp_path / "modified"
    modified.mkdir()
    (modified / "requirements.txt").write_text("httpx>=0.27.0\n", encoding="utf-8")
    (modified / "app.py").write_text("import httpx\nprint(httpx.get('https://example.com'))\n", encoding="utf-8")

    diff = compute_directory_diff(orig, modified)
    assert "-requests==2.28.0" in diff
    assert "+httpx>=0.27.0" in diff

    result = run_post_implementation_verification(
        scan_id="scan_post_001",
        original_repo=orig,
        working_copy=modified,
        target_package="requests",
        candidate_package="httpx"
    )

    # Dependency removed check should pass
    chk_names = {c["name"]: c["status"] for c in result.checks}
    assert chk_names.get("Remove `requests` from dependencies") == "PASS"
    assert chk_names.get("Add `httpx` to dependencies") == "PASS"
    assert chk_names.get("Remove `requests` source imports") == "PASS"
    assert chk_names.get("Verify `httpx` source imports") == "PASS"
