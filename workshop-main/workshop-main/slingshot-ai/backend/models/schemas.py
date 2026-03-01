"""Pydantic schemas used by API routes."""

from typing import Optional

from pydantic import BaseModel, Field


class SalesPredictionRequest(BaseModel):
    months_ahead: int = Field(default=3, ge=1, le=12)
    csv_data: Optional[str] = Field(
        default=None,
        description="Optional CSV content uploaded from the UI. If omitted, DB data is used.",
    )


class PredictionPoint(BaseModel):
    month: str
    predicted_revenue: float


class SalesPredictionResponse(BaseModel):
    model: str
    predictions: list[PredictionPoint]


class HealthScoreResponse(BaseModel):
    score: float
    revenue_growth_pct: float
    retention_rate_pct: float
    burn_rate_pct: float
    recommendation: str


class StartupDataPoint(BaseModel):
    month: str
    revenue: float
    retention_rate: float
    burn_rate: float
