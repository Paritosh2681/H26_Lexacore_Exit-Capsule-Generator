from app.metadata.risk_scorer import calculate_risk_score

def test_risk_scorer_active_package():
    meta = {
        "package_name": "modern-pkg",
        "found": True,
        "latest_version": "2.5.0",
        "latest_release_date": "2026-08-01T00:00:00Z",
        "is_yanked": False,
        "requires_python": ">=3.10",
        "total_releases": 15
    }
    report = calculate_risk_score(meta, pinned_version="==2.5.0")
    assert report.overall_score == 0.0
    assert report.level == "LOW"

def test_risk_scorer_abandoned_and_lag():
    meta = {
        "package_name": "abandoned-pkg",
        "found": True,
        "latest_version": "4.0.0",
        "latest_release_date": "2020-01-01T00:00:00Z",  # > 4 years ago
        "is_yanked": False,
        "requires_python": ">=3.6",
        "total_releases": 5
    }
    # Pinned at 1.0.0 vs latest 4.0.0 (3 major versions lag) + > 3 yrs inactivity
    report = calculate_risk_score(meta, pinned_version="==1.0.0")
    assert report.overall_score >= 50.0
    assert report.level in ["HIGH", "CRITICAL"]

def test_risk_scorer_yanked():
    meta = {
        "package_name": "yanked-pkg",
        "found": True,
        "latest_version": "1.2.0",
        "is_yanked": True,
        "yanked_reason": "Security vulnerability",
        "requires_python": ">=3.8"
    }
    report = calculate_risk_score(meta, pinned_version="==1.2.0")
    assert report.overall_score >= 40.0
    assert any("Yanked" in f.name for f in report.factors)

def test_risk_scorer_missing_metadata():
    meta = {
        "package_name": "nonexistent-pkg",
        "found": False,
        "error": "404 Not Found"
    }
    report = calculate_risk_score(meta)
    assert report.overall_score == 30.0
    assert "Metadata unavailable" in report.uncertainty
