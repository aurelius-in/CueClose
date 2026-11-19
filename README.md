# CueClose

**The tour keeps moving. The books keep up.**

CueClose is a synthetic-data portfolio demonstration exploring explainable touring-finance workflows, explicit approvals, double-entry accounting, reconciliation, and audit evidence. It is an original portfolio project and is not affiliated with VectorOne.

> Foundation milestone: an exact-decimal journal-draft validator and architecture documentation exist. The repository does not yet persist or post financial transactions.

## Principles

- A model may recommend; it never directly posts to a ledger.
- Use Python `Decimal` and decimal-string API amounts.
- Preserve source evidence and server-owned workflow state.
- Prefer a modular monolith until an operational need proves otherwise.
- Keep all demo data synthetic and all channel delivery simulated.

## Repository map

```text
api/app/domain/ledger.py  # exact decimal journal-draft invariants
api/app/api/              # FastAPI schemas and routes
api/tests/                # domain and API contract tests
docs/architecture/        # RM-ODP viewpoints and traceability
docs/decisions/           # architecture decision records
IMPLEMENTATION_STATUS.md
```

## Run locally

```bash
cd api
python -m venv .venv
. .venv/bin/activate       # Windows: .venv\Scripts\Activate.ps1
python -m pip install -e '.[dev]'
uvicorn app.main:app --reload --port 8000
```

Open `http://localhost:8000/docs`. Current endpoints validate a draft; they do not persist or post it.

```bash
python -m pytest
ruff check .
ruff format --check .
```
