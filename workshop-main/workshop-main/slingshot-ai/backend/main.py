"""FastAPI entrypoint for Slingshot AI backend."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.database.db import initialize_database
from backend.routes.api import router as api_router

app = FastAPI(
    title="Slingshot AI API",
    version="1.0.0",
    description="AI-powered startup growth intelligence platform backend.",
)

# Allow local frontend dev server requests.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event() -> None:
    """Create DB tables and load demo data at startup."""
    initialize_database()


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "Slingshot AI backend is running"}


app.include_router(api_router)
