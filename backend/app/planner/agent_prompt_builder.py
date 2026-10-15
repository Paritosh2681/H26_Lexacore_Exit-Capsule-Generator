from typing import Dict, Any, List

def build_ai_agent_prompt(
    target_package: str,
    candidate_package: str,
    plan_dict: Dict[str, Any],
    ast_usages: List[Dict[str, Any]],
    capsule_ref: str
) -> str:
    """
    Generate a precise, ready-to-copy instruction prompt for an AI coding agent
    (e.g., Claude, GPT-4, Cursor, Gemini) to execute the migration safely.
    """
    files_list = "\n".join([f"- `{f}`" for f in plan_dict.get("files_likely_to_change", [])]) or "- (None detected)"
    ordered_steps = "\n".join([f"{i+1}. {step}" for i, step in enumerate(plan_dict.get("ordered_implementation_steps", []))])

    prompt = f"""# AI CODING AGENT DIRECTIVE: PYTHON DEPENDENCY MIGRATION
Target Migration: Replace `{target_package}` with `{candidate_package}`
Exit Capsule Reference: {capsule_ref}

## STRICT INSTRUCTIONS FOR THE RECEIVING AGENT:
1. **Inspect before modifying**: Inspect the files listed below in the repository before writing or altering any code.
2. **Follow Approved Scope Only**: Strictly replace `{target_package}` with `{candidate_package}`. Do NOT perform unrelated refactorings, style reorganizations, or cosmetic changes.
3. **Respect Existing Conventions**: Adhere strictly to existing project code formatting, typing conventions, and test framework patterns.
4. **Safety & Working Copy**: Create a new git branch (e.g., `git checkout -b migrate/{target_package}-to-{candidate_package}`) before applying changes.
5. **No Credential Exposure**: Never hardcode API keys, secrets, or tokens.
6. **Execute Prescribed Tests**: Run the repository tests before and after changes.
7. **Transparent Reporting**: Provide an honest summary of every changed file, test commands executed, and actual test results. If a test fails, report the error honestly—do not fabricate success.
8. **Stop on Contradiction**: If you detect runtime behavior that contradicts the migration plan or introduces breaking architectural shifts, STOP and request human input.

---

## 1. Scope & Affected Files:
{files_list}

## 2. Ordered Implementation Steps:
{ordered_steps}

## 3. Dependency Declaration Updates:
{plan_dict.get("dependency_file_changes", "Update requirements.txt / pyproject.toml")}

## 4. Code Migration & API Changes:
{plan_dict.get("code_migration_steps", "Replace imports and update function calls according to plan.")}

## 5. Verification Commands:
```bash
{plan_dict.get("commands_to_execute", "python -m pytest -v")}
```

## 6. Definition of Done:
- All imports and references to `{target_package}` are replaced with `{candidate_package}`.
- Requirements files accurately reflect `{candidate_package}` and remove `{target_package}`.
- All unit and integration tests pass cleanly with zero regressions.
- Git diff confirms only migration-relevant lines are modified.
"""
    return prompt.strip()
