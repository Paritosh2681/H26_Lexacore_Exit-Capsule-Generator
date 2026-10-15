from app.planner.implementation_planner import generate_implementation_plan
from app.planner.agent_prompt_builder import build_ai_agent_prompt

def test_implementation_planner_generation():
    ast_usages = [
        {"file_path": "app.py", "line_number": 10, "referenced_symbol": "get", "call_expression": "requests.get()"}
    ]
    report = generate_implementation_plan(
        scan_id="scan_plan_001",
        target_package="requests",
        candidate_package="httpx",
        ast_usages=ast_usages,
        developer_notes="Approved for migration to httpx."
    )

    plan = report.plan_dict
    assert "app.py" in plan["files_likely_to_change"]
    assert len(plan["ordered_implementation_steps"]) >= 5
    assert "Approved for migration to httpx." in report.plan_markdown

    # Check prompt builder
    prompt = report.ai_agent_prompt
    assert "Replace `requests` with `httpx`" in prompt
    assert "STRICT INSTRUCTIONS FOR THE RECEIVING AGENT" in prompt
    assert "app.py" in prompt
