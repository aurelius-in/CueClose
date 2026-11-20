#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

cleanup() {
  if [[ -n "${API_PID:-}" ]]; then kill "$API_PID" 2>/dev/null || true; fi
  if [[ -n "${WEB_PID:-}" ]]; then kill "$WEB_PID" 2>/dev/null || true; fi
}
trap cleanup EXIT

# Optional: also run the Python FastAPI reference service for OpenAPI/docs.
if [[ -f "$ROOT/api/.venv/bin/activate" ]]; then
  # shellcheck disable=SC1091
  source "$ROOT/api/.venv/bin/activate"
  cd "$ROOT/api"
  uvicorn app.main:app --host 127.0.0.1 --port 8847 --reload &
  API_PID=$!
fi

cd "$ROOT/web"
npm run dev -- --port 3847 --hostname 127.0.0.1 &
WEB_PID=$!

echo "CueClose Web  http://127.0.0.1:3847"
echo "CueClose API  http://127.0.0.1:8847/docs  (Python reference service, if started)"
wait
