# Computational viewpoint

## Purpose

This view assigns target responsibilities to software contexts. The implementation is intentionally much smaller today.

| Context | Responsibility | Current status |
|---|---|---|
| Ingestion | Preserve and normalize source documents | Planned |
| Classification | Produce evidence-linked recommendations | Planned |
| Policies | Evaluate approval and autonomy rules | Planned |
| Approvals | Check authority and record decisions | Planned |
| Ledger | Own posting and reversal authority | Draft validation only |
| Reconciliation | Compare legacy and ledger snapshots | Planned |
| Orchestration | State, assignments, inbox, outbox | Planned |
| Audit | Explainable append-only evidence | Planned |
| Query | Registered grounded questions | Planned |
| Identity | Organization, membership, role | Planned |
| HTTP API | Transport validation and route adaptation | Two foundation routes |

## Implemented ownership

- `api/app/domain/ledger.py`: exact-decimal validation with no framework dependency.
- `api/app/api/schemas.py`: strict Pydantic transport schemas.
- `api/app/api/routes.py`: thin adapters.
- `api/app/main.py`: application composition and OpenAPI.

`POST /api/v1/ledger/validate` validates and returns `persisted: false`; it cannot post a journal.
