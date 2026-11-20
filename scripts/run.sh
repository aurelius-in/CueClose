#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/web"
npm install
npm run build
exec npm run start -- --port "${PORT:-3847}" --hostname 0.0.0.0
