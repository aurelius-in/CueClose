# ADR-001: Modular monolith

- **Status:** Accepted
- **Date:** 2026-11-19

## Decision

Begin with one Python application and explicit bounded-context modules rather than distributed services.

## Rationale

A small team needs understandable transactions and low operational overhead. Framework-independent domain code remains separable, allowing later extraction if measured need appears.
