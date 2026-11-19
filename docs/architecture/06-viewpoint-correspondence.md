# Viewpoint correspondence

| Requirement | Enterprise policy | Information invariant | Component | Mechanism | Verification |
|---|---|---|---|---|---|
| Exact draft balance | E-01 | Debits equal credits | `JournalDraft` | `Decimal` | Domain tests |
| Decimal safety | E-05 | Finite, nonnegative, cent precision | `parse_amount` | String parsing | Invalid and rounding tests |
| No implicit posting | E-01/E-06 | No posted or persisted state | Ledger route | Explicit response fields | API contract test |
| Authorized posting (planned) | E-01 | Approved, immutable journal | Ledger + approval services | DB transaction | Future authorization tests |
| Secure callback (planned) | E-03 | Hashed token, expiry, version | Approval service | Replay checks | Future token tests |
| Tenant isolation (planned) | E-01 | Organization scope | Identity/repositories | Scoped queries | Future cross-tenant test |

Every planned requirement is a design constraint until code and a run result exist.
