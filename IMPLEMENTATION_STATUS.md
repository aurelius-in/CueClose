# Implementation status

Last updated: 2026-11-19

| Capability | Status | Evidence |
|---|---|---|
| Exact journal-draft validation | Implemented | `api/app/domain/ledger.py` |
| Deterministic approval policy | Implemented | `api/app/domain/policy.py` |
| Cue inbox + evidence + recommendations | Implemented | `api/app/infrastructure/seed.py`, `/api/v1/cues` |
| Approvals with actor/role/reason | Implemented | `/api/v1/cues/{id}/approvals` |
| Ledger posting + idempotency | Implemented | `/api/v1/cues/{id}/post` |
| Reconciliation explanations | Implemented | `/api/v1/reconciliation` |
| Append-only audit trail | Implemented | `/api/v1/audit` |
| Branded splash + workspace UI | Implemented | `web/` |
| Architecture docs and diagrams | Implemented | `docs/` |
| Process-memory seeded persistence | Implemented (demo) | `api/app/infrastructure/store.py` |
| Waiting-on-me queue + show filters | Implemented (demo) | Command + `/app/cues` |
| Duplicate-invoice acknowledge gate | Implemented (demo) | `findDuplicateCandidates` + approvals |
| Needs-info / ambient channel cards | Reserved for working session | product discovery notes |
| Cited producer asks | Reserved for working session | product discovery notes |
| PostgreSQL persistence | Not started | Store interface is swap-ready |
| Real channel delivery | Out of scope for demo | Simulated only |

## Verification

```bash
cd api && source .venv/bin/activate && pytest && ruff check . && ruff format --check .
cd ../web && npm run build
```

Do not mark a check passed until the command actually runs in your environment.
