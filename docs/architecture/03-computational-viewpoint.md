# Computational viewpoint

## Purpose

This view assigns target responsibilities to software contexts. The implementation is intentionally much smaller today.

| Context | Responsibility | Current status |
|---|---|---|
| Ingestion | Preserve and normalize source documents | Seeded synthetic evidence packs |
| Classification | Produce evidence-linked recommendations | Seeded recommendations on cues |
| Policies | Evaluate approval and autonomy rules | Implemented in `domain/policy.py` |
| Approvals | Check authority and record decisions | Implemented |
| Ledger | Own posting and reversal authority | Validate + post with idempotency |
| Reconciliation | Compare legacy and ledger snapshots | Explain-only variances |
| Orchestration | State, assignments, inbox, outbox | Cue status workflow |
| Audit | Explainable append-only evidence | Implemented |
| Query | Registered grounded questions | Planned |
| Identity | Organization, membership, role | Demo actors and roles |
| HTTP API | Transport validation and route adaptation | Workflow + foundation routes |
| Web workspace | Branded operator surface | Next.js static UI |

## Implemented ownership

- `api/app/domain/`: money, ledger, policy, models.
- `api/app/application/workflow.py`: review, approve, post, explain.
- `api/app/infrastructure/`: seeded store.
- `web/`: splash, command center, cue inbox, ledger, reconciliation, audit.
