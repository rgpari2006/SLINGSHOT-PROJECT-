from io import StringIO

import pandas as pd
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from backend.database.db import get_db
from backend.models.startup_metrics import StartupMetric

router = APIRouter(prefix="", tags=["data"])


@router.get("/data")
def get_data(db: Session = Depends(get_db)):
    records = db.query(StartupMetric).order_by(StartupMetric.id.asc()).all()
    return [
        {
            "month": r.month,
            "revenue": r.revenue,
            "retention": r.retention,
            "burn_rate": r.burn_rate,
            "marketing_spend": r.marketing_spend,
        }
        for r in records
    ]


@router.post("/data/upload")
async def upload_data(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Please upload a CSV file.")

    content = (await file.read()).decode("utf-8")
    df = pd.read_csv(StringIO(content))

    required_cols = {"month", "revenue", "retention", "burn_rate", "marketing_spend"}
    if not required_cols.issubset(df.columns):
        raise HTTPException(
            status_code=400,
            detail=f"CSV must include columns: {', '.join(sorted(required_cols))}",
        )

    db.query(StartupMetric).delete()
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
    return {"message": "Dataset uploaded successfully", "rows": len(df)}
