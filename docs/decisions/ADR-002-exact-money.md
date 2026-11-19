# ADR-002: Exact decimal arithmetic

- **Status:** Accepted
- **Date:** 2026-11-19

## Decision

Use `Decimal` and decimal-string API inputs. Future database money uses `NUMERIC(18,2)`.

## Rationale

Binary floating-point is unsuitable for financial arithmetic. Invalid precision is rejected rather than silently rounded.
