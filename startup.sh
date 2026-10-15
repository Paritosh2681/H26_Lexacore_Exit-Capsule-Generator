#!/usr/bin/env bash
# Production startup: ensures the frontend build exists, then serves API + UI.
# Platform notes:
#   - Python dependencies are installed by the platform (pip install -r requirements.txt).
#   - The runtime image MUST support venv creation (python:3.12 full image, not slim),
#     because the verification engine builds ephemeral virtualenvs at request time.
#   - Set PORT (default 8000) and secrets (GEMMA_API_KEY, GITHUB_CLIENT_SECRET, ...) as env vars.
set -euo pipefail
cd "$(dirname "$0")"

PORT="${PORT:-8000}"

if [ ! -d frontend/dist ]; then
  echo "startup.sh: frontend/dist missing - building frontend..."
  (cd frontend && npm ci && npm run build)
else
  echo "startup.sh: using existing frontend/dist build"
fi

cd backend
PY_BIN="$(command -v python3 || command -v python)"
echo "startup.sh: starting uvicorn on 0.0.0.0:${PORT} (${PY_BIN})"
exec "${PY_BIN}" -m uvicorn app.main:app --host 0.0.0.0 --port "${PORT}"
