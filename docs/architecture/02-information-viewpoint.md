# Information viewpoint

## Purpose

This view describes target data and invariants. The current code only contains an in-memory journal-draft value model.

```mermaid
erDiagram
  ORGANIZATION ||--o{ TOUR : owns
  TOUR ||--o{ SHOW : includes
  SOURCE_DOCUMENT ||--o{ INVOICE : supports
  INVOICE ||--o{ RECOMMENDATION : receives
  INVOICE ||--o{ APPROVAL_REQUEST : may_require
  APPROVAL_REQUEST ||--o{ APPROVAL_DECISION : records
  INVOICE ||--o| JOURNAL_ENTRY : posts_as
  JOURNAL_ENTRY ||--|{ JOURNAL_LINE : contains
  ORGANIZATION ||--o{ AUDIT_EVENT : records
```

## Invariants

- Every persisted future business record is scoped to an organization.
- Python `Decimal` owns calculation; API amounts are strings; future database amounts use `NUMERIC(18,2)`.
- A journal draft has at least two lines.
- Each line has exactly one positive debit or credit side.
- Debits equal credits in one currency.
- Posted entries are immutable in the target design; corrections use reversals.
- Approval decisions record actor, role, policy version, state version, reason, and timestamp.

## Status

No database schema or persistent lifecycle exists in the foundation milestone.
