from pathlib import Path

import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from backend.database.db import Base, SessionLocal, engine
from backend.models.startup_metrics import StartupMetric
from backend.routes import data, health, predict

app = FastAPI(title="Slingshot AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)


def seed_initial_data_if_empty(db: Session) -> None:
    if db.query(StartupMetric).count() > 0:
        return

    csv_path = Path(__file__).resolve().parents[1] / "data" / "sample_startup_data.csv"
    df = pd.read_csv(csv_path)
    for _, row in df.iterrows():
        db.add(
            StartupMetric(
                month=str(row["month"]),
                revenue=float(row["revenue"]),
                retention=float(row["retention"]),
                burn_rate=float(row["burn_rate"]),
                marketing_spend=float(row["marketing_spend"]),
            )
        )
    db.commit()


@app.on_event("startup")
def on_startup() -> None:
    db = SessionLocal()
    try:
        seed_initial_data_if_empty(db)
    finally:
        db.close()


app.include_router(data.router)
app.include_router(predict.router)
app.include_router(health.router)


@app.get("/")
def root():
    return {"message": "Slingshot AI backend is running"}
