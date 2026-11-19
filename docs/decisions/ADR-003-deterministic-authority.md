# ADR-003: Separate recommendation from authority

- **Status:** Accepted design constraint
- **Date:** 2026-11-19

## Decision

Recommendations are evidence-backed proposals. Policies and authorization decide whether an action may proceed. Ledger code owns posting.

## Rationale

A model score or generated explanation is not authorization. This boundary prevents model output from directly mutating financial state.
