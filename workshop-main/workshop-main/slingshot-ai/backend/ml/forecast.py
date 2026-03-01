"""ML utilities for forecasting startup sales revenue."""

from __future__ import annotations

import csv
import io
from datetime import datetime

import numpy as np
from sklearn.linear_model import LinearRegression

# AMD/ROCm NOTE:
# For a hackathon demo, we use scikit-learn LinearRegression running on CPU.
# To make this architecture AMD-ready, replace/train the model in PyTorch and move
# tensors/model to GPU with torch.device("cuda") on systems with ROCm-enabled PyTorch.
# The API layer can stay the same, while this module swaps in a GPU-accelerated model.


def _parse_month_label(month_label: str) -> datetime:
    return datetime.strptime(month_label, "%Y-%m")


def parse_csv_data(csv_text: str) -> list[dict]:
    """Parse user-uploaded CSV data into the expected structure."""
    reader = csv.DictReader(io.StringIO(csv_text.strip()))
    parsed = []
    for row in reader:
        parsed.append(
            {
                "month": row["month"],
                "revenue": float(row["revenue"]),
                "retention_rate": float(row.get("retention_rate", 0)),
                "burn_rate": float(row.get("burn_rate", 0)),
            }
        )
    return parsed


def forecast_revenue(history: list[dict], months_ahead: int = 3) -> list[dict]:
    """Train regression model and forecast future monthly revenue."""
    if len(history) < 3:
        raise ValueError("Need at least 3 months of data for prediction.")

    months = np.arange(len(history)).reshape(-1, 1)
    revenues = np.array([row["revenue"] for row in history])

    model = LinearRegression()
    model.fit(months, revenues)

    future_idx = np.arange(len(history), len(history) + months_ahead).reshape(-1, 1)
    future_pred = model.predict(future_idx)

    last_month_dt = _parse_month_label(history[-1]["month"])
    predictions = []
    for i, predicted in enumerate(future_pred, start=1):
        year = last_month_dt.year + ((last_month_dt.month - 1 + i) // 12)
        month = ((last_month_dt.month - 1 + i) % 12) + 1
        label = f"{year:04d}-{month:02d}"
        predictions.append({"month": label, "predicted_revenue": round(float(predicted), 2)})

    return predictions
