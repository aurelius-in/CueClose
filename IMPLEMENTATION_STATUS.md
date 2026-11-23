# Implementation status

Last updated: 2026-11-23

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
| Architecture docs and diagrams | Implemented | `docs/` (overview HTML/PDF + viewpoints) |
| Demo walkthrough script + PDF | Implemented | `docs/guides/demo-walkthrough.*` |
| Process-memory seeded persistence | Implemented (demo) | `api/app/infrastructure/store.py` |
| Classic / Pro edition toggle | Implemented (demo) | `web/src/lib/edition.ts` |
| Waiting-on-me queue + show filters | Implemented (Pro) | Command + `/app/cues` |
| Duplicate-invoice acknowledge gate | Implemented (Pro) | `findDuplicateCandidates` + approvals |
| Needs-info / ambient channel cards | Planned | Product backlog |
| Cited producer asks | Planned | Product backlog |
| PostgreSQL persistence | Not started | Store interface is swap-ready |
| Real channel delivery | Out of scope for demo | Simulated only |

## Verification

```bash
cd api && source .venv/bin/activate && pytest && ruff check . && ruff format --check .
cd ../web && npm run build
```

Do not mark a check passed until the command actually runs in your environment.
