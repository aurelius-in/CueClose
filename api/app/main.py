"""FastAPI application composition root."""

from fastapi import FastAPI

from app.api.routes import router

app = FastAPI(
    title="CueClose API",
    version="0.1.0",
    description="Synthetic demo. Validates journal drafts only; it does not post or persist financial transactions.",
)
app.include_router(router, prefix="/api/v1")
