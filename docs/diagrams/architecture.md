# CueClose architecture

## Modular monolith

```mermaid
flowchart LR
  subgraph Web
    Splash[Splash / brand]
    Cmd[Command center]
    Inbox[Cue inbox]
    Rec[Reconciliation]
    Aud[Audit timeline]
  end

  subgraph API["FastAPI modular monolith"]
    Routes[HTTP adapters]
    AppSvc[Application workflow]
    Policy[Deterministic policy]
    Ledger[Exact ledger domain]
    Store[Seeded demo store]
  end

  Splash --> Cmd
  Cmd --> Routes
  Inbox --> Routes
  Rec --> Routes
  Aud --> Routes
  Routes --> AppSvc
  AppSvc --> Policy
  AppSvc --> Ledger
  AppSvc --> Store
```

## Repository layout

```text
CueClose/
  api/                 FastAPI service and domain
    app/api/           Transport schemas and routes
    app/application/   Use-cases / workflow orchestration
    app/domain/        Money, ledger, policy, models
    app/infrastructure Seeded in-memory store
    tests/             Contract and domain tests
  web/                 Next.js branded workspace
  brand/               Logo, mark, color tokens
  docs/                RM-ODP views, ADRs, diagrams
  scripts/             Local run helpers
```

## Design constraints

- Models recommend; they do not post.
- Money is `Decimal` in domain code and decimal strings on the wire.
- Approvals are server-authorized and audited.
- Posted journals are immutable; reconciliation explains variance.
- Demo data is synthetic; channels are simulated.
