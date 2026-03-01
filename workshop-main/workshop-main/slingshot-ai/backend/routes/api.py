"""REST API routes for dashboard data and AI insights."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from backend.database.db import fetch_startup_data
from backend.ml.forecast import forecast_revenue, parse_csv_data
from backend.models.schemas import (
    HealthScoreResponse,
    SalesPredictionRequest,
    SalesPredictionResponse,
    StartupDataPoint,
)

router = APIRouter()


@router.get("/data", response_model=list[StartupDataPoint])
def get_data() -> list[dict]:
    """Return startup performance history for charts and cards."""
    return fetch_startup_data()


@router.post("/predict-sales", response_model=SalesPredictionResponse)
def predict_sales(payload: SalesPredictionRequest) -> dict:
    """Train a simple regression model and return future revenue predictions."""
    try:
        history = parse_csv_data(payload.csv_data) if payload.csv_data else fetch_startup_data()
        predictions = forecast_revenue(history, months_ahead=payload.months_ahead)
    except Exception as exc:  # keep broad for demo API resiliency
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return {"model": "LinearRegression", "predictions": predictions}


@router.get("/health-score", response_model=HealthScoreResponse)
def get_health_score() -> dict:
    """Compute startup health score based on growth, retention, and burn metrics."""
    data = fetch_startup_data()
    if len(data) < 2:
        raise HTTPException(status_code=400, detail="Not enough data to compute health score.")

    first_revenue = data[0]["revenue"]
    last_revenue = data[-1]["revenue"]
    revenue_growth_pct = ((last_revenue - first_revenue) / first_revenue) * 100 if first_revenue else 0

    avg_retention = sum(row["retention_rate"] for row in data) / len(data)
    avg_burn = sum(row["burn_rate"] for row in data) / len(data)

    # Weighted score with simple caps to keep output in 0..100.
    growth_component = max(0, min(40, revenue_growth_pct * 0.6))
    retention_component = max(0, min(35, avg_retention * 0.35))
    burn_component = max(0, min(25, (100 - avg_burn) * 0.25))

    score = round(growth_component + retention_component + burn_component, 2)

    if score >= 80:
        recommendation = "Excellent momentum. Continue investing in growth channels."
    elif score >= 60:
        recommendation = "Healthy trajectory. Improve retention to unlock higher growth."
    else:
        recommendation = "At-risk trend. Reduce burn and increase recurring revenue focus."

    return {
        "score": score,
        "revenue_growth_pct": round(revenue_growth_pct, 2),
        "retention_rate_pct": round(avg_retention, 2),
        "burn_rate_pct": round(avg_burn, 2),
        "recommendation": recommendation,
    }
