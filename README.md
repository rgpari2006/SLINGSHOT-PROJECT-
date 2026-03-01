# Slingshot AI – AI-Powered Startup Growth Intelligence Platform

Slingshot AI is a production-ready hackathon demo that combines a **React dashboard**, **FastAPI backend**, and a simple **ML forecasting model** to help startup teams monitor growth and make faster decisions.

## Features

- 📊 **Dashboard** with KPI cards, revenue trend, and forecast charts.
- 🤖 **AI Sales Prediction API** (`POST /predict-sales`) powered by scikit-learn regression.
- 🧠 **AI Growth Assistant** chat widget with intelligent mock recommendations.
- 📥 **CSV upload** to replace sample data.
- 🧮 **Health Score** endpoint (`GET /health-score`) based on revenue growth, retention, and burn rate.
- ⚡ **AMD-ready architecture notes** for future ROCm + PyTorch acceleration.

## Tech Stack

- **Frontend:** React + Vite + Chart.js
- **Backend:** FastAPI + SQLAlchemy
- **ML:** scikit-learn Linear Regression (upgrade path to PyTorch)
- **Database:** SQLite (drop-in migration path to PostgreSQL)

## Project Structure

```txt
slingshot-ai/
├── backend/
│   ├── __init__.py
│   ├── main.py
│   ├── database/
│   │   ├── __init__.py
│   │   └── db.py
│   ├── ml/
│   │   ├── __init__.py
│   │   └── sales_forecast.py
│   ├── models/
│   │   ├── __init__.py
│   │   └── startup_metrics.py
│   └── routes/
│       ├── __init__.py
│       ├── data.py
│       ├── health.py
│       └── predict.py
├── data/
│   └── sample_startup_data.csv
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── styles.css
│       ├── components/
│       │   ├── DataUploader.jsx
│       │   ├── ForecastChart.jsx
│       │   ├── GrowthAssistant.jsx
│       │   ├── MetricCard.jsx
│       │   └── RevenueChart.jsx
│       └── services/
│           └── api.js
├── .gitignore
├── package.json
├── README.md
└── requirements.txt
```

## API Design

### `GET /data`
Returns historical startup metrics.

### `POST /predict-sales`
Predicts future revenue.

Example request body:

```json
{
  "future_months": 4,
  "marketing_growth": 0.04
}
```

### `GET /health-score`
Returns overall startup health score (`0-100`) and component metrics.

### `POST /data/upload`
Upload a CSV with columns:
`month, revenue, retention, burn_rate, marketing_spend`

## Local Setup

### 1) Clone repository

```bash
git clone <your-repo-url>
cd slingshot-ai
```

### 2) Backend setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn backend.main:app --reload
```

Backend runs on `http://127.0.0.1:8000`.

### 3) Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://127.0.0.1:5173`.

## AMD GPU (ROCm) Optimization Notes

Current model uses scikit-learn for simplicity. For AMD acceleration:

1. Replace regression model with PyTorch model in `backend/ml/sales_forecast.py`.
2. Use ROCm-compatible PyTorch build.
3. Move tensors/model to:

```python
device = torch.device("cuda")  # on ROCm-enabled AMD GPUs
model.to(device)
```

4. Keep API endpoints unchanged (`/predict-sales`) so frontend integration remains stable.

This keeps the hackathon demo easy to run on CPU while remaining architecture-ready for AMD GPU scaling.

## Deployment Notes (GitHub-ready)

- Push this project to GitHub as a monorepo.
- Use GitHub Actions later for CI (optional).
- Deploy backend to Render/Fly.io/EC2.
- Deploy frontend to Vercel/Netlify.
- Set `VITE_API_URL` in frontend deployment environment.

## Sample Data

The included file `data/sample_startup_data.csv` has realistic month-wise startup metrics across revenue, retention, burn rate, and marketing spend.
