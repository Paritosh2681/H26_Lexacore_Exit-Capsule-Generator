# Exit Capsule Generator: System Architecture

## 1. System Overview & Core Principle

**Exit Capsule Generator** is an AI-powered Python dependency resilience and migration planning developer tool designed around one foundational principle:

> **"AI proposes. The tool verifies. The developer approves. Tests provide evidence."**

The platform detects dependency maintenance risks, maps AST usage patterns in source code, formulates structured migration recommendations using **Gemma 4**, independently tests those claims in isolated virtual environments, records empirical proof in a versioned **Dependency Exit Capsule**, and generates actionable implementation plans for developers or AI coding agents.

```mermaid
flowchart TD
    Repo[Local Python Repository] --> Discovery[1. Dependency Discovery]
    Repo --> AST[2. Static AST Usage Analysis]
    Discovery --> Meta[3. PyPI Metadata & Risk Scorer]
    AST --> Gemma[4. Gemma 4 Migration Planner]
    Meta --> Gemma
    Gemma --> Verifier[5. Independent 10-Point Verification Engine]
    Verifier --> Sandbox[Isolated venv & Temporary Repo Sandbox]
    Verifier --> Capsule[6. Dependency Exit Capsule (JSON & MD)]
    Capsule --> Review[7. Developer Review & Approval Gate]
    Review --> Plan[8. Verified Implementation Planner]
    Plan --> AgentPrompt[AI Coding Agent Prompt]
    Plan --> Checklist[Manual Migration Checklist]
    Checklist --> PostVerify[9. Post-Implementation Verifier]
    PostVerify --> Capsule
```

---

## 2. Core Architectural Subsystems

### 2.1 Backend & Static Analysis Engine (`backend/app/scanner/`)
- **Dependency Discovery (`discovery.py`)**: Declarative parser supporting `requirements.txt`, `requirements-dev.txt`, and `pyproject.toml` (PEP 621, Poetry, Flit). Categorizes dependencies into `declared`, `candidate_undeclared` (observed in AST but unlisted), and `candidate_unused` (declared in requirements but uncalled).
- **AST Code Usage Analysis (`ast_analyzer.py`)**: Uses Python's native `ast` module with `ScopeVisitor`. Tracks module imports, local aliases (`from requests import get as fetch`), call expressions, and enclosing function or class scopes (`ServiceClient::post_config`). Detects dynamic import invocations (`__import__`, `importlib.import_module`) and marks them with uncertainty flags.
- **Normalization & Mapping (`package_mappings.py`)**: Implements standard PEP 503 normalization and handles discrepancies between import names and PyPI distribution names (e.g. `PIL` &rarr; `pillow`, `yaml` &rarr; `pyyaml`, `bs4` &rarr; `beautifulsoup4`).

### 2.2 Metadata & Deterministic Risk Engine (`backend/app/metadata/`)
- **PyPI Client (`pypi_client.py`)**: Asynchronous/cached client with timeout handling and offline resilience. Queries package metadata, release histories, yanked statuses, and Python constraints.
- **Explainable Risk Scorer (`risk_scorer.py`)**: Computes a deterministic 0-100 risk score based on objective factor contributions:
  - Prolonged upstream inactivity (>3 years: +30, >2 years: +20, >1 year: +10)
  - Yanked releases (+40)
  - Major or multi-minor version lag (+15 to +25)
  - Deprecated Python constraints (+25)
  - Missing PyPI metadata (+30)

### 2.3 Gemma 4 AI Migration Planner (`backend/app/ai/`)
- **Adapter & Model Validator (`gemma_client.py`)**: Connects to OpenAI-compatible endpoints or local Ollama instances. Strictly validates that the configured model is a Gemma 4 model (e.g. `google/gemma-4-27b-it` or `gemma4:latest`). Enforces structured JSON output matching `GemmaMigrationProposal` schema with bounded retries.
- **Fail-Safe Resilience**: If `GEMMA_API_KEY` is not configured or remote inference is disabled, the system operates in deterministic mode without failure.

### 2.4 Independent Verification Engine (`backend/app/verification/`)
- **10-Point Independent Verification Pipeline**:
  1. *Candidate Package Existence on PyPI*
  2. *Compatible Release Availability & Yanked Check*
  3. *Python Version Constraint Check*
  4. *Clean Installation in Ephemeral Isolated Virtualenv*
  5. *Exported Symbol & Module Inspection*
  6. *Static AST API Symbol Compatibility Check*
  7. *Baseline Test Suite Execution in Isolated Working Copy*
  8. *Replacement Test Execution*
  9. *Like-for-Like Test Outcome Comparison*
  10. *AI Claim Reconciliation & Status Assignment*
- Every check receives an empirical status: `PASS`, `FAIL`, `INCONCLUSIVE`, `NOT_RUN`, `AI_CLAIM_REJECTED`, or `UNVERIFIED`.
- Calculates an objective, evidence-based migration confidence score (0-100 heuristic).

### 2.5 Capsule & Implementation Planner (`backend/app/capsule/`, `planner/`, `post_verify/`)
- **Capsule Generator**: Emits validated, versioned `capsule.json` and human-readable `capsule.md` with an immutable evidence ledger.
- **Verified Implementation Planner**: Activated only upon explicit developer review and approval. Formulates a 15-point roadmap, file-by-file changes, interactive checklist, and AI coding agent prompt.
- **Post-Implementation Verifier**: Evaluates modified working copies, computes unified diffs, verifies import refactoring, and updates the historical capsule.

### 2.6 Persistence Layer (`backend/app/database.py`)
- Standard SQLite3 persistence engine with normalized tables: `scans`, `dependencies`, `ai_recommendations`, `verification_runs`, `approval_decisions`, `capsules`, `implementation_plans`, and `post_verifications`.
- Zero credentials or source code stored in plaintext database tables.

---

## 3. Technology Stack Summary

| Layer | Technologies |
| :--- | :--- |
| **Backend** | Python 3.12+, FastAPI, Pydantic, Python `ast`, `tomllib`, `subprocess`, `venv`, `sqlite3` |
| **Frontend** | React 18, TypeScript, Vite, Vanilla CSS design tokens, Lucide icons |
| **Testing** | Pytest, Pytest-Cov, FastAPI TestClient |
| **AI Integration** | Gemma 4 (`google/gemma-4-27b-it`, `gemma4:latest`) via OpenAI API adapter / Ollama |
