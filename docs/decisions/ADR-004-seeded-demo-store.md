# ADR-004: Seeded process-memory store for the runnable demo

## Status

Accepted

## Context

The portfolio demo must run with minimal setup while still showing posting, idempotency, reconciliation, and audit behavior.

## Decision

Use a deterministic in-memory store seeded with the synthetic Northline Arena Tour dataset. Keep domain and application services free of framework and storage details so a PostgreSQL adapter can replace the store later.

## Consequences

- One-command local demos are reliable.
- Process restart clears runtime mutations unless the operator uses Reset demo (which reseeds).
- Production persistence, multi-tenant isolation, and durability remain future work and are documented as such.
