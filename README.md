# CueClose

**The tour keeps moving. The books keep up.**

CueClose is a touring-finance coordination product for live production close: ambient invoice cues, evidence-linked recommendations, explicit approvals, exact double-entry posting, reconciliation that explains variance, and an append-only audit trail.

It began as a client-inspired portfolio build for entertainment and production finance workflows. The demo runs on synthetic tour data so anyone can explore the product without real books or live integrations.

## Why this shape

| Principle | How it shows up |
|---|---|
| A model may recommend; it never posts | Recommendations are visible on cues; posting requires a server-checked human approval path |
| Exact money | Python `Decimal` in domain code; API amounts are decimal strings |
| Authority is explicit | Role, materiality, and confidence gates live in `api/app/domain/policy.py` |
| Evidence over vibes | Every cue carries source excerpts; every decision writes audit events |
| Demo-safe | Fictional Horizon Arena Tour data; simulated channels only |

## Editions

The workspace ships two product editions so stakeholders can compare the core close path with the operations desk:

| Edition | What you get |
|---|---|
| **Classic** | Cue inbox, evidence, role-gated approvals, posting, reconciliation, audit |
| **Pro** | Classic plus waiting-on-me queue, show filters, and a duplicate-invoice acknowledge gate |

Toggle **Edition** in the app header.

## Quick start

### One-process UI demo (recommended)

The Next.js app embeds a same-contract demo API, so the branded workspace runs as a single Node process:

```bash
cd web
npm install
npm run build
npm run start -- --port 3847
```

Open `http://127.0.0.1:3847`.

Or:

```bash
chmod +x scripts/run.sh
./scripts/run.sh
```

### Python reference service

The FastAPI modular monolith remains the architecture reference with exact-decimal domain tests:

```bash
cd api
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\Activate.ps1
pip install -e ".[dev]"
uvicorn app.main:app --host 127.0.0.1 --port 8847
```

Open `http://127.0.0.1:8847/docs`.

### Split hot reload

```bash
chmod +x scripts/dev.sh
./scripts/dev.sh
```

- Web: `http://127.0.0.1:3847`
- Python API docs: `http://127.0.0.1:8847/docs`

### Tests

```bash
cd api
source .venv/bin/activate
pytest
ruff check .
ruff format --check .
```

## Product walkthrough (five minutes)

1. Enter from the splash screen into **Command**.
2. On a Public publish, you start as a guest (Jordan Blake). Private or Team apps use your Cursor sign-in and can select **Maya Chen** (tour controller).
3. Open **Cue inbox** → `Northwind Rigging Co.` (`cue_001`).
4. Read evidence and the recommendation, then **Approve** and **Post journal** (as Maya).
5. Switch actor to **Jordan Blake** and try approving a material cue: the API denies it.
6. Visit **Ledger**, **Reconciliation**, and **Audit** to show posting, variance explanation, and trail.

Reset anytime with **Reset demo** in the header (tour controller only).

Personas are bound server-side to the signed-in Cursor viewer or an HttpOnly guest cookie. The browser never sends an actor id to authorize a decision.

## Architecture

```text
web/        Branded Next.js workspace + embedded demo API routes
api/        FastAPI modular monolith (architecture reference)
  domain/   Ledger invariants, money, policy, models
  application/  Cue review → approval → post → reconcile
  infrastructure/  Seeded in-memory store (swap-ready)
brand/      Logo, mark, color tokens
docs/       RM-ODP viewpoints, ADRs, workflow diagrams
scripts/    Local run helpers
```

Readable diagrams:

- [`docs/diagrams/architecture.md`](docs/diagrams/architecture.md)
- [`docs/diagrams/workflow.md`](docs/diagrams/workflow.md)
- [`docs/architecture/`](docs/architecture/)

## Local clone (Windows)

See [`LOCAL_ACCESS.md`](LOCAL_ACCESS.md) or run [`GET_LOCAL_COPY.ps1`](GET_LOCAL_COPY.ps1) to clone into `C:\local\CueClose`.

## Brand

| Token | Value |
|---|---|
| Cue green | `#00A859` |
| Close navy | `#002D5B` |
| Paper | `#F4F8F6` |

Assets live in `brand/` and are copied into `web/public/` for the UI.

## Status

See [`IMPLEMENTATION_STATUS.md`](IMPLEMENTATION_STATUS.md). The foundation ledger validator remains; the runnable demo covers inbox, approvals, posting with idempotency, reconciliation explanations, audit, Classic/Pro editions, and UI.
