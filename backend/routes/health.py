from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database.db import get_db
from backend.models.startup_metrics import StartupMetric

router = APIRouter(prefix="", tags=["health"])


@router.get("/health-score")
def health_score(db: Session = Depends(get_db)):
    rows = db.query(StartupMetric).order_by(StartupMetric.id.asc()).all()
    if len(rows) < 2:
        return {"score": 50, "note": "Not enough data for a robust score."}

    revenues = [r.revenue for r in rows]
    retentions = [r.retention for r in rows]
    burn_rates = [r.burn_rate for r in rows]

    growth_ratio = (revenues[-1] - revenues[0]) / max(revenues[0], 1)
    growth_score = max(0, min(100, (growth_ratio + 0.5) * 100))

    retention_score = sum(retentions) / len(retentions)  # already in 0-100 style values

    max_burn = max(burn_rates)
    min_burn = min(burn_rates)
    normalized_burn = 100 if max_burn == min_burn else 100 - (
        ((burn_rates[-1] - min_burn) / (max_burn - min_burn)) * 100
    )

    final_score = round((0.45 * growth_score) + (0.35 * retention_score) + (0.20 * normalized_burn), 2)

    return {
        "score": final_score,
        "components": {
            "revenue_growth": round(growth_score, 2),
            "retention": round(retention_score, 2),
            "burn_rate_efficiency": round(normalized_burn, 2),
        },
    }
