# Dependency Exit Capsule: Schema Specification

## 1. Overview
The **Dependency Exit Capsule** (`capsule.json` and `capsule.md`) encapsulates the complete, reproducible audit trail of a Python repository scan, dependency risk evaluations, Gemma 4 migration proposals, independent empirical verification checks, and developer approval states.

Schema Version: `1.0.0`

---

## 2. Evidence Classifications
Every substantive claim in the capsule carries an explicit classification:

| Classification | Definition |
| :--- | :--- |
| `observed` | Directly discovered via static file parsing or AST analysis (e.g., import locations, declared requirements). |
| `executed` | Empirically executed via an independent subprocess command or test suite. |
| `verified` | An empirical check confirming that an assertion holds (e.g., candidate package installed cleanly, tests passed). |
| `ai_suggested_unverified` | Proposed by Gemma 4 but not yet validated by an independent empirical check. |
| `inconclusive` | An empirical check ran but returned ambiguous results (e.g., partial symbol overlap, untyped module exports). |
| `rejected` | An AI claim or assertion that was disproven by empirical evidence (e.g., AI claimed low difficulty, but installation failed). |
| `not_run` | A planned check that could not run (e.g., test suite not detected or live network disabled). |

---

## 3. JSON Schema Specification

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "ExitCapsuleData",
  "type": "object",
  "required": [
    "schema_version",
    "scan_id",
    "repository_path",
    "scan_timestamp",
    "tool_version",
    "dependency_inventory",
    "risk_assessments",
    "ast_usage_locations",
    "ai_recommendations",
    "verification_checks",
    "evidence_ledger",
    "rejected_ai_claims",
    "unverified_claims",
    "unresolved_risks",
    "limitations",
    "approval_state",
    "confidence_score"
  ],
  "properties": {
    "schema_version": { "type": "string", "example": "1.0.0" },
    "scan_id": { "type": "string", "example": "scan_20261015_120000_a1b2c3" },
    "repository_path": { "type": "string", "example": "C:/projects/sample-app" },
    "scan_timestamp": { "type": "number", "example": 1760515200.0 },
    "tool_version": { "type": "string", "example": "1.0.0" },
    "dependency_inventory": {
      "type": "object",
      "properties": {
        "declared": { "type": "array", "items": { "type": "string" } },
        "candidate_undeclared": { "type": "array", "items": { "type": "string" } },
        "candidate_unused": { "type": "array", "items": { "type": "string" } },
        "optional": { "type": "array", "items": { "type": "string" } },
        "dev": { "type": "array", "items": { "type": "string" } }
      }
    },
    "risk_assessments": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "package_name": { "type": "string" },
          "overall_score": { "type": "number", "minimum": 0, "maximum": 100 },
          "level": { "type": "string", "enum": ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
          "factors": { "type": "array" },
          "uncertainty": { "type": "string" }
        }
      }
    },
    "ast_usage_locations": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "file_path": { "type": "string" },
          "line_number": { "type": "integer" },
          "imported_module": { "type": "string" },
          "referenced_symbol": { "type": "string", "nullable": true },
          "call_expression": { "type": "string", "nullable": true },
          "enclosing_scope": { "type": "string", "nullable": true },
          "code_snippet": { "type": "string" },
          "is_uncertain": { "type": "boolean" }
        }
      }
    },
    "ai_recommendations": { "type": "array" },
    "verification_checks": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "check_name": { "type": "string" },
          "status": {
            "type": "string",
            "enum": ["PASS", "FAIL", "INCONCLUSIVE", "NOT_RUN", "AI_CLAIM_REJECTED", "UNVERIFIED"]
          },
          "evidence": { "type": "string" },
          "command_executed": { "type": "string", "nullable": true },
          "elapsed_seconds": { "type": "number" }
        }
      }
    },
    "evidence_ledger": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "claim": { "type": "string" },
          "classification": { "type": "string" },
          "evidence": { "type": "string" },
          "timestamp": { "type": "number" }
        }
      }
    },
    "confidence_score": { "type": "number", "minimum": 0, "maximum": 100 }
  }
}
```
