# Exit Capsule Generator
> **AI-Powered Python Dependency Resilience and Migration Planning Tool**
>
> **Product Principle:** *AI proposes. The tool verifies. The developer approves. Tests provide evidence.*

[![Python 3.12+](https://img.shields.io/badge/Python-3.12%2B-blue.svg)](https://www.python.org/)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![React 18](https://img.shields.io/badge/React-18-61dafb.svg)](https://react.dev/)

---

## 1. What is Exit Capsule Generator?

**Exit Capsule Generator** is a developer tool that analyzes local Python repositories, identifies dependency maintenance risks, maps dependency usage in source code via static Python Abstract Syntax Tree (AST) analysis, formulates structured migration proposals powered by **Gemma 4**, independently verifies those proposals in isolated virtual environments, and produces a tamper-evident **Dependency Exit Capsule** (`capsule.json` and `capsule.md`).

Upon developer review and explicit approval, the engine generates an evidence-backed **15-point Implementation Plan** and a copy-paste directive for AI coding agents (Cursor, Claude, Copilot, Gemini).

---

## 2. Core Capabilities & Architectural Workflow

```mermaid
flowchart LR
    Repo[1. Python Repository] --> AST[2. AST Code Analysis]
    Repo --> Discovery[3. Dependency Discovery]
    Discovery --> Scorer[4. Explainable Risk Scorer 0-100]
    AST --> Gemma[5. Gemma 4 Migration Planner]
    Scorer --> Gemma
    Gemma --> Verifier[6. Independent 10-Point Verification Engine]
    Verifier --> Sandbox[7. Ephemeral Sandbox & Tests]
    Sandbox --> Capsule[8. Dependency Exit Capsule]
    Capsule --> Review[9. Developer Approval Gate]
    Review --> Plan[10. Verified Implementation Plan]
    Plan --> PostVerify[11. Post-Implementation Verifier]
```

1. **Static AST Analysis**: Never executes repository code during scanning. Tracks imports, bindings, call expressions, and enclosing function/class scopes (`ServiceClient::fetch_data`).
2. **Deterministic Risk Scoring**: 0 to 100 explainable score combining release age, major/minor version lag, yanked release flags, and legacy Python incompatibilities.
3. **Gemma 4 Migration Engine**: Tailored prompts sending bounded AST usages and project constraints to Gemma 4 (`google/gemma-4-27b-it` or `gemma4:latest`).
4. **Independent 10-Point Verification Pipeline**: Empirically confirms PyPI existence, checks Python constraints, attempts clean installation in an ephemeral virtual environment, inspects module exports, compares AST symbol coverage, and executes baseline tests.
5. **Dependency Exit Capsule**: Produces versioned `capsule.json` and rich `capsule.md` with an immutable evidence ledger classifying every claim (`observed`, `executed`, `verified`, `ai_suggested_unverified`, `rejected`, `inconclusive`, `not_run`).
6. **Developer Approval Gate**: Enforces explicit human-in-the-loop authorization before migration plans or patches are generated.
7. **Verified Implementation Planner**: Emits a 15-point roadmap, interactive checklist, and AI coding agent prompt.
8. **Post-Implementation Verification**: Analyzes modified working copies, computes unified diffs, verifies import removal/addition, and links verification outcomes to the capsule.

---

## 3. Quick Start & Setup

### Prerequisites
- Python 3.12 or 3.13
- Node.js v18+ (for frontend development)

### Step 1: Clone and Configure Environment
```bash
git clone https://github.com/Paritosh2681/H26_Lexacore_Exit-Capsule-Generator.git
cd H26_Lexacore_Exit-Capsule-Generator

# Copy environment configuration
cp .env.example .env
```

Configure your `.env` settings:
```ini
# Optional: To enable Gemma 4 AI planning (system works 100% deterministically without it)
GEMMA_API_KEY=your_api_key_here
GEMMA_API_BASE_URL=https://api.together.xyz/v1
GEMMA_MODEL=google/gemma-4-27b-it
```

### Step 2: Install Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Step 3: Run Backend & Web Application
The FastAPI backend serves both the API endpoints and the built frontend UI directly:
```bash
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
Open your browser to: **`http://127.0.0.1:8000`**

*(Optional) For frontend active development with hot-reload:*
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173`**

---

## 4. Running the Automated Test Suite

The project includes unit and integration tests with 100% passing coverage across all subsystems:

```bash
cd backend
python -m pytest -v
```

Tests verify:
- Path traversal prevention & command execution timeouts
- PEP 503 package normalization & requirement parsing (`requirements.txt`, `pyproject.toml`)
- AST usage extraction, alias tracking, and enclosing scope attribution
- Deterministic risk score calculations and factor contributions
- Gemma 4 client model validation and structured JSON parsing
- Independent 10-point verification engine and API symbol matching
- Exit Capsule schema validation and markdown generation
- Developer review, approval gates, and 15-point implementation plan builder
- Post-implementation unified diff and verification reporting
- Full end-to-end workflow execution

---

## 5. Walkthrough: Generating a Genuine Capsule from LinkWatch

Follow these steps to analyze the organizer-provided `LinkWatch` repository (or the included sample test fixture):

1. **Start the Application**: Navigate to `http://127.0.0.1:8000`.
2. **Click "New Scan"**:
   - In the repository path field, enter the path to the `LinkWatch` repository (or click *"Use Sample Test Fixture"*).
   - If Gemma 4 is configured, check *"Enable Gemma 4 Migration Planner"*.
   - Click **"Launch Scan Pipeline"**.
3. **Inspect Inventory & Risk**:
   - The scanner displays the dependency inventory, identifying declared dependencies (e.g. `requests`, `pyyaml`), candidate undeclared dependencies, and candidate unused dependencies.
   - Click **"Inspect & Plan"** on `requests` (Risk Score: Medium).
4. **Run Independent Verification**:
   - In the dependency details page, review AST usage locations (e.g. `requests.get` inside `URLWatcher::check_health`).
   - In the Verification panel, set candidate package to `httpx` and click **"Run Verification"**.
   - Watch the independent 10-point check suite execute, confirming PyPI existence, Python compatibility, clean venv installation, and symbol exports.
5. **Review & Approve**:
   - Enter your notes in the Developer Review Gate and click **"Approve Migration"**.
6. **Generate Verified Implementation Plan**:
   - Click **"Proceed to Implementation Planner"**.
   - Review the 15-point migration checklist.
   - Click **"Copy Directive"** to copy the ready-to-use prompt for your AI coding agent.
7. **Download Capsule**:
   - Click **"View Exit Capsule"** to download `capsule.json` and `capsule.md`.

---

## 6. Security & Sandboxing Architecture

- **No Remote Code Uploads**: Source code is analyzed locally on your machine.
- **Subprocess Safety**: All subprocess commands are executed with `shell=False`, array-passed arguments, strict execution timeouts (default: 120s), and byte output caps (512 KB).
- **Filesystem Isolation**: Tests run in temporary working copies (`temp_workspaces/`); your original repository remains untouched.
- **Secret Redaction**: API keys and tokens are stripped from logs, databases, and generated capsules.

See [docs/SECURITY.md](docs/SECURITY.md) for complete details.

---

## 7. Documentation & References

- [System Architecture](docs/ARCHITECTURE.md)
- [Capsule Schema & Evidence Ledger](docs/CAPSULE_SCHEMA.md)
- [Security & Sandboxing Model](docs/SECURITY.md)
- [Gemma 4 Model Guide](docs/GEMMA_MODEL_GUIDE.md)
- [Sample LinkWatch Capsule JSON](examples/linkwatch_sample_capsule.json)
- [Sample LinkWatch Capsule Markdown](examples/linkwatch_sample_capsule.md)
- [Sample Implementation Plan](examples/linkwatch_sample_plan.md)

---

## 8. License

Licensed under the [Apache License, Version 2.0](LICENSE).