# Architecture docs

## Start here

- **[Architecture Overview](overview.html)** ([PDF](CueClose-Architecture-Overview.pdf))  
  Dual-audience product overview: executive summary, system context, request flow, Classic vs Pro map, ledger spine, then engineer sections on data model, API, auth/session, edition gating, waiting-on-me, duplicate gate, and tradeoffs.

## RM-ODP viewpoints

| File | Viewpoint |
|---|---|
| [01-enterprise-viewpoint.md](01-enterprise-viewpoint.md) | Roles and policies |
| [02-information-viewpoint.md](02-information-viewpoint.md) | Data and invariants |
| [03-computational-viewpoint.md](03-computational-viewpoint.md) | Context responsibilities |
| [04-engineering-viewpoint.md](04-engineering-viewpoint.md) | Distribution and build |
| [05-technology-viewpoint.md](05-technology-viewpoint.md) | Runtime choices |
| [06-viewpoint-correspondence.md](06-viewpoint-correspondence.md) | Cross-links |
| [07-threat-model.md](07-threat-model.md) | Threat notes for the demo |

Companion diagrams: [`../diagrams/`](../diagrams/). ADRs: [`../decisions/`](../decisions/).
