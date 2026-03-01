from __future__ import annotations

from pathlib import Path
from typing import List

import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression

DATA_PATH = Path(__file__).resolve().parents[2] / "data" / "sample_startup_data.csv"


def _load_dataset() -> pd.DataFrame:
    df = pd.read_csv(DATA_PATH)
    df["month_index"] = np.arange(1, len(df) + 1)
    return df


def train_sales_model() -> tuple[LinearRegression, pd.DataFrame]:
    """Train a simple regression model on month index + marketing spend.

    AMD/ROCm note:
    - This baseline uses scikit-learn (CPU) for hackathon simplicity.
    - For heavier workloads, replace with a PyTorch regression/LSTM model and
      move tensors/model to `device = torch.device("cuda")` on ROCm-enabled AMD GPUs.
    - The API contract can remain identical while model internals become GPU-accelerated.
    """

    df = _load_dataset()
    X = df[["month_index", "marketing_spend"]]
    y = df["revenue"]

    model = LinearRegression()
    model.fit(X, y)
    return model, df


def predict_future_sales(future_months: int = 3, marketing_growth: float = 0.03) -> List[dict]:
    model, df = train_sales_model()

    last_month_idx = int(df["month_index"].iloc[-1])
    last_marketing_spend = float(df["marketing_spend"].iloc[-1])

    rows = []
    for offset in range(1, future_months + 1):
        month_idx = last_month_idx + offset
        projected_marketing_spend = last_marketing_spend * ((1 + marketing_growth) ** offset)
        prediction = model.predict([[month_idx, projected_marketing_spend]])[0]
        rows.append(
            {
                "month_index": month_idx,
                "projected_marketing_spend": round(projected_marketing_spend, 2),
                "predicted_revenue": round(float(prediction), 2),
            }
        )
    return rows
