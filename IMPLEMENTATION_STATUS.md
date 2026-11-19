# Implementation status

Last updated: 2026-11-19

| Capability | Status | Evidence |
|---|---|---|
| Exact journal-draft validation | Implemented, local verification required | `api/app/domain/ledger.py` |
| FastAPI health and validation routes | Implemented, local verification required | `api/app/api/routes.py` |
| Unit/API tests | Authored, local verification required | `api/tests/` |
| PostgreSQL persistence | Not started | No database configuration or migrations |
| Invoice and approval workflows | Not started | No implementation exists |
| Ledger posting/idempotency/reversal | Not started | Only draft validation exists |
| Reconciliation | Not started | No implementation exists |
| Frontend | Not started | No UI exists |

Run from `api/`:

```bash
python -m pip install -e '.[dev]'
python -m pytest
ruff check .
ruff format --check .
```

Do not mark a check passed until the command actually runs in your environment.
