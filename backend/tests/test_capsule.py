import json
from pathlib import Path
from app.capsule.schema import ExitCapsuleData, CapsuleEvidenceItem
from app.capsule.markdown_builder import generate_capsule_markdown

def test_capsule_schema_and_markdown():
    evidence = [
        CapsuleEvidenceItem(
            claim="PyPI metadata verified",
            classification="verified",
            evidence="Latest version 0.28.1 found",
            timestamp=1700000000.0
        )
    ]
    capsule = ExitCapsuleData(
        schema_version="1.0.0",
        scan_id="scan_test_123",
        repository_path="/test/repo",
        scan_timestamp=1700000000.0,
        dependency_inventory={"declared": ["requests"], "candidate_undeclared": [], "candidate_unused": []},
        risk_assessments=[{"package_name": "requests", "overall_score": 15.0, "level": "LOW"}],
        ast_usage_locations=[],
        ai_recommendations=[],
        verification_checks=[{"check_name": "1. Existence", "status": "PASS", "evidence": "Confirmed"}],
        evidence_ledger=evidence,
        rejected_ai_claims=[],
        unverified_claims=[],
        unresolved_risks=[],
        limitations=["Static analysis limitations"],
        approval_state={"requests": "APPROVED"},
        confidence_score=85.0
    )

    # Validate json export
    capsule_json_str = capsule.json()
    assert "scan_test_123" in capsule_json_str

    # Validate markdown generation
    md = generate_capsule_markdown(capsule)
    assert "# Dependency Exit Capsule: `scan_test_123`" in md
    assert "## 1. Executive Summary" in md
    assert "85.0/100" in md
    assert "requests" in md
