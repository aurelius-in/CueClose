# Threat model

## Scope

The foundation API has no persistence, authentication, upload, model, or external messaging. This document records future boundaries and controls.

| Threat | Required control before feature ships |
|---|---|
| Precision loss | Preserve decimal strings and exact persisted types |
| Forged role or tenant | Derive identity and organization server-side |
| Replayed approval | Hashed one-time token, expiry, idempotency, state check |
| Prompt injection | Treat source text as untrusted; strict model schema; no posting authority |
| External channel effect | Simulated-only default; explicit integration gate |
| Cross-tenant access | Organization-scoped queries and isolation tests |
| Public reset misuse | Protected, synthetic-tenant-only reset |
| Secret leakage | `.env` exclusion, secret management, no public environment variables |

No security claim is made for the foundation API.
