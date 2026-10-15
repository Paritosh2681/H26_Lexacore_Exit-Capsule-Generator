import json
import re
import httpx
from typing import Dict, Any, Optional
from app.config import settings
from app.core.exceptions import AIConfigurationError
from app.ai.schemas import GemmaMigrationProposal

SYSTEM_PROMPT = """You are an expert Python dependency migration planner powered by Gemma 4.
Analyze the target dependency, risk factors, and AST usage locations provided.
Propose a modern, active, well-maintained drop-in or near-equivalent replacement package.
You MUST output strictly valid JSON matching the following schema:
{
  "schema_version": "1.0.0",
  "dependency": "<original_package>",
  "risk_summary": "<summary_of_risks>",
  "candidate_replacement": "<candidate_package>",
  "reasons": ["<reason_1>", "<reason_2>"],
  "proposed_migration_steps": ["<step_1>", "<step_2>"],
  "expected_api_differences": [
    {"original_api": "<old_call>", "replacement_api": "<new_call>", "notes": "<notes>"}
  ],
  "relevant_source_locations": ["<file:line>"],
  "potential_compatibility_problems": ["<problem_1>"],
  "suggested_tests": ["<test_1>"],
  "estimated_migration_difficulty": "LOW" | "MEDIUM" | "HIGH",
  "confidence_explanation": "<explanation>",
  "assumptions_and_unknowns": ["<assumption_1>"]
}
Do not include any introductory or concluding text outside the JSON object.
"""

def validate_gemma_model_name(model_name: str) -> None:
    """Validate that the configured model is a Gemma 4 or compatible Gemma model."""
    normalized = model_name.lower().replace("-", "").replace("_", "")
    if "gemma" not in normalized:
        raise AIConfigurationError(
            f"Configured model '{model_name}' does not appear to be a Gemma 4 model. "
            "Please configure a valid Gemma 4 model (e.g., 'google/gemma-4-27b-it' or 'gemma4:latest') in GEMMA_MODEL."
        )

def extract_json_from_text(text: str) -> Dict[str, Any]:
    """Extract JSON object from raw LLM text output even if surrounded by markdown code blocks."""
    cleaned = text.strip()
    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", cleaned, re.DOTALL)
    if match:
        cleaned = match.group(1).strip()
    else:
        # Try finding outer braces
        start = cleaned.find("{")
        end = cleaned.rfind("}")
        if start != -1 and end != -1:
            cleaned = cleaned[start:end+1]
    return json.loads(cleaned)

class GemmaClient:
    """Client adapter for communicating with Gemma 4 via OpenAI-compatible endpoints or Ollama."""

    def __init__(self, api_key: Optional[str] = None, base_url: Optional[str] = None, model: Optional[str] = None):
        self.api_key = settings.GEMMA_API_KEY if api_key is None else api_key
        self.base_url = (settings.GEMMA_API_BASE_URL if base_url is None else base_url).rstrip("/")
        self.model = settings.GEMMA_MODEL if model is None else model

    def is_configured(self) -> tuple[bool, str]:
        """Check if client is configured and ready."""
        # Ollama local endpoints do not strictly require an API key
        is_local_ollama = "localhost" in self.base_url or "127.0.0.1" in self.base_url
        if not is_local_ollama and not self.api_key:
            return False, "GEMMA_API_KEY is not configured in environment."
        
        try:
            validate_gemma_model_name(self.model)
        except AIConfigurationError as e:
            return False, str(e)

        return True, "Gemma 4 provider configured."

    def plan_migration(
        self,
        package_name: str,
        pinned_version: Optional[str],
        risk_summary: str,
        ast_usages: list[Dict[str, Any]],
        project_python_version: str = ">=3.10",
        timeout: float = 30.0
    ) -> GemmaMigrationProposal:
        """
        Request a migration plan from Gemma 4 with bounded retries.
        """
        configured, reason = self.is_configured()
        if not configured:
            raise AIConfigurationError(f"Cannot generate AI migration plan: {reason}")

        # Limit ast usages to bounded summary to avoid token overflow
        bounded_usages = []
        for u in ast_usages[:10]:
            bounded_usages.append({
                "file": u.get("file_path"),
                "line": u.get("line_number"),
                "symbol": u.get("referenced_symbol"),
                "call": u.get("call_expression"),
                "scope": u.get("enclosing_scope"),
                "snippet": u.get("code_snippet")
            })

        user_content = {
            "target_dependency": package_name,
            "current_version": pinned_version or "unpinned",
            "risk_evidence": risk_summary,
            "project_python_constraint": project_python_version,
            "observed_code_usages": bounded_usages
        }

        is_google_api = "googleapis.com" in self.base_url
        clean_model = self.model.replace("models/", "").replace("google/", "")

        # Bounded retry: up to 2 attempts
        last_error = ""
        for attempt in range(2):
            try:
                with httpx.Client(timeout=timeout) as client:
                    if is_google_api:
                        endpoint = f"{self.base_url}/models/{clean_model}:generateContent?key={self.api_key}"
                        combined_text = f"{SYSTEM_PROMPT}\n\nAnalyze the following dependency and output strictly valid JSON matching the schema:\n{json.dumps(user_content, indent=2)}"
                        payload = {
                            "contents": [{"parts": [{"text": combined_text}]}],
                            "generationConfig": {"temperature": 0.2}
                        }
                        response = client.post(endpoint, json=payload)
                        if response.status_code != 200:
                            raise AIConfigurationError(
                                f"Google Gemma API error (HTTP {response.status_code}): {response.text[:300]}"
                            )
                        data = response.json()
                        candidates = data.get("candidates", [])
                        if not candidates:
                            raise AIConfigurationError("Google Gemma API returned no response candidates.")
                        parts = candidates[0].get("content", {}).get("parts", [])
                        raw_content = "".join([p.get("text", "") for p in parts])
                    else:
                        endpoint = f"{self.base_url}/chat/completions"
                        headers = {"Content-Type": "application/json"}
                        if self.api_key:
                            headers["Authorization"] = f"Bearer {self.api_key}"
                        payload = {
                            "model": self.model,
                            "messages": [
                                {"role": "system", "content": SYSTEM_PROMPT},
                                {"role": "user", "content": json.dumps(user_content, indent=2)}
                            ],
                            "temperature": 0.2,
                            "response_format": {"type": "json_object"} if "ollama" not in self.base_url else None
                        }
                        payload = {k: v for k, v in payload.items() if v is not None}
                        response = client.post(endpoint, headers=headers, json=payload)
                        if response.status_code != 200:
                            raise AIConfigurationError(
                                f"Gemma provider API error (HTTP {response.status_code}): {response.text[:300]}"
                            )
                        data = response.json()
                        choices = data.get("choices", [])
                        if not choices:
                            raise AIConfigurationError("Gemma provider returned empty response choices.")
                        raw_content = choices[0].get("message", {}).get("content", "")

                    parsed_json = extract_json_from_text(raw_content)
                    proposal = GemmaMigrationProposal(**parsed_json)
                    return proposal

            except AIConfigurationError:
                raise
            except Exception as e:
                last_error = str(e)

        raise AIConfigurationError(f"Failed to obtain valid proposal from Gemma 4 after retries: {last_error}")
