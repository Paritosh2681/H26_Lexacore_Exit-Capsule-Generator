import pytest
from pathlib import Path
from app.cli import run_analysis_pipeline

def test_cli_analysis_pipeline(tmp_path):
    fixtures_dir = Path(__file__).parent / "fixtures" / "sample_project"
    output_dir = tmp_path / "cli_report"
    
    exit_code = run_analysis_pipeline(
        repo_path=fixtures_dir,
        output_dir=output_dir,
        run_ai=False,
        capsule_format="all",
        fail_on_risk=False,
        quiet=True
    )
    
    assert exit_code == 0
    assert (output_dir / "capsule.json").exists()
    assert (output_dir / "capsule.md").exists()
