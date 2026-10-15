# Gemma 4 Model Integration Guide

## 1. Supported Model Identifiers
The Exit Capsule Generator validates that the configured AI model belongs to the **Gemma 4** family:

- **Together AI / DeepInfra / OpenRouter**: `google/gemma-4-27b-it` or `google/gemma-4-9b-it`
- **Ollama (Local)**: `gemma4:latest` or `gemma4:27b`
- **Google Vertex AI / Gemini API**: `gemma-4-27b-it`

If an incompatible model (e.g. `gpt-4o` or `claude-3-opus`) is configured in `GEMMA_MODEL`, the client adapter halts with an explicit `AIConfigurationError` rather than silently substituting an unsupported model.

---

## 2. Configuration Options

### Option A: Hosted OpenAI-Compatible Provider (Recommended for Cloud Inference)
In `.env` or system environment:
```bash
GEMMA_API_KEY=your_together_or_provider_key
GEMMA_API_BASE_URL=https://api.together.xyz/v1
GEMMA_MODEL=google/gemma-4-27b-it
ENABLE_REMOTE_INFERENCE=true
```

### Option B: Local Ollama (Zero Cloud Exposure)
Ensure Ollama is running locally:
```bash
ollama run gemma4:latest
```
In `.env`:
```bash
GEMMA_API_KEY=""
GEMMA_API_BASE_URL=http://localhost:11434/v1
GEMMA_MODEL=gemma4:latest
ENABLE_REMOTE_INFERENCE=false
```

### Option C: Deterministic Mode (No AI Key Required)
If you leave `GEMMA_API_KEY` empty and do not run Ollama, the Exit Capsule Generator remains **100% operational**:
- Dependency discovery continues to map declared, undeclared, and unused libraries.
- AST parsing maps every call expression and symbol.
- PyPI metadata queries and deterministic 0-100 risk scoring operate at full fidelity.
- Independent 10-point verification and capsule generation operate normally.
