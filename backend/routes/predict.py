from fastapi import APIRouter
from pydantic import BaseModel, Field

from backend.ml.sales_forecast import predict_future_sales

router = APIRouter(prefix="", tags=["prediction"])


class PredictionRequest(BaseModel):
    future_months: int = Field(default=3, ge=1, le=12)
    marketing_growth: float = Field(default=0.03, ge=0.0, le=1.0)


@router.post("/predict-sales")
def predict_sales(payload: PredictionRequest):
    predictions = predict_future_sales(
        future_months=payload.future_months,
        marketing_growth=payload.marketing_growth,
    )
    return {"predictions": predictions}
