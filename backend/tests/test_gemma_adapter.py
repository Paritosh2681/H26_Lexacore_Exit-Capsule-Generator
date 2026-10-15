import pytest
from app.ai.gemma_client import validate_gemma_model_name, extract_json_from_text, GemmaClient
from app.ai.schemas import GemmaMigrationProposal
from app.core.exceptions import AIConfigurationError

def test_validate_gemma_model_name():
    # Valid Gemma 4 / Gemma model identifiers
    validate_gemma_model_name("google/gemma-4-27b-it")
    validate_gemma_model_name("gemma4:latest")
    validate_gemma_model_name("gemma-2-9b-it")

    # Incompatible non-Gemma model must raise error
    with pytest.raises(AIConfigurationError) as exc_info:
        validate_gemma_model_name("gpt-4o")
    assert "does not appear to be a Gemma 4 model" in str(exc_info.value)

def test_extract_json_from_markdown():
    text_with_fences = """
Here is the migration plan:
```json
{
  "schema_version": "1.0.0",
  "dependency": "requests",
  "risk_summary": "Legacy package with sync limitations",
  "candidate_replacement": "httpx",
  "reasons": ["Modern async and sync API", "HTTP/2 support"],
  "proposed_migration_steps": ["Replace import requests with import httpx"],
  "expected_api_differences": [
    {"original_api": "requests.get()", "replacement_api": "httpx.get()", "notes": "Drop-in"}
  ],
  "relevant_source_locations": ["app.py:5"],
  "potential_compatibility_problems": ["Slightly different timeout defaults"],
  "suggested_tests": ["Run integration tests"],
  "estimated_migration_difficulty": "LOW",
  "confidence_explanation": "High API similarity",
  "assumptions_and_unknowns": ["No custom adapters used"]
}
```
Thank you!
"""
    parsed = extract_json_from_text(text_with_fences)
    assert parsed["dependency"] == "requests"
    assert parsed["candidate_replacement"] == "httpx"

    proposal = GemmaMigrationProposal(**parsed)
    assert proposal.dependency == "requests"
    assert proposal.candidate_replacement == "httpx"
    assert proposal.estimated_migration_difficulty == "LOW"

def test_gemma_client_unconfigured():
    # Client with empty API key and remote URL should report unconfigured with clear message
    client = GemmaClient(api_key="", base_url="https://api.together.xyz/v1", model="google/gemma-4-27b-it")
    configured, msg = client.is_configured()
    assert not configured
    assert "GEMMA_API_KEY is not configured" in msg
