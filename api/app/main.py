"""FastAPI application composition root."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.infrastructure.seed import ensure_seeded


@asynccontextmanager
async def lifespan(_app: FastAPI):
    ensure_seeded()
    yield


app = FastAPI(
    title="CueClose API",
    version="0.2.0",
    description=(
        "Synthetic touring-finance demo. Models may recommend; only authorized humans post. "
        "All data is fictional and all channels are simulated. "
        "This Python service is the architecture reference; the Next.js app also embeds a "
        "same-contract demo API for one-process UI runs."
    ),
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api/v1")


@app.get("/healthz")
def healthz() -> dict[str, str]:
    return {"status": "ok"}
