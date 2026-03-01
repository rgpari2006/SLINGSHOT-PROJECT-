# Slingshot AI – AI-Powered Startup Growth Intelligence Platform

Production-ready hackathon demo that combines a FastAPI backend, a clean JavaScript dashboard frontend, and an ML-based sales forecasting API.

## 🚀 Features

- **Sign-in page** with polished UI and session-gated dashboard access (demo auth)
- **Dashboard page** with metric cards and revenue/forecast chart (Chart.js)
- **AI Sales Prediction API** (`POST /predict-sales`) using scikit-learn Linear Regression
- **Startup Health Score API** (`GET /health-score`) based on growth, retention, and burn-rate logic
- **AI Growth Assistant** mock chatbot with strategic responses
- **CSV upload** to run predictions on custom startup data
- **SQLite-backed demo storage** seeded from realistic sample data
- **AMD/ROCm-ready architecture comments** in ML module for future GPU acceleration

## 🧱 Folder Structure

```text
slingshot-ai/
├── backend/
│   ├── __init__.py
│   ├── main.py
│   ├── routes/
│   │   ├── __init__.py
│   │   └── api.py
│   ├── models/
│   │   ├── __init__.py
│   │   └── schemas.py
│   ├── ml/
│   │   ├── __init__.py
│   │   └── forecast.py
│   └── database/
│       ├── __init__.py
│       └── db.py
├── frontend/
│   ├── src/
│   │   ├── app.js
│   │   ├── index.html
│   │   └── style.css
│   ├── components/
│   │   └── card.js
│   ├── pages/
│   │   └── dashboard.js
│   └── services/
│       └── api.js
├── data/
│   └── sample_startup_data.csv
├── .gitignore
├── package.json
├── README.md
└── requirements.txt
```

## 🔌 API Endpoints

- `GET /data` → Returns monthly startup metrics
- `POST /predict-sales` → Trains model and predicts future revenue
- `GET /health-score` → Returns startup health score and recommendation

### `POST /predict-sales` example payload

```json
{
  "months_ahead": 3,
  "csv_data": "month,revenue,retention_rate,burn_rate\n2024-01,40000,78,55"
}
```

## 🧮 Health Score Formula

Score is out of 100 and uses weighted components:
- Revenue growth (max 40)
- Retention quality (max 35)
- Burn efficiency (max 25)

The backend returns score plus recommendation bands:
- `>= 80`: Excellent momentum
- `60-79`: Healthy trajectory
- `< 60`: At-risk trend

## ⚙️ Local Setup

### 1) Backend (FastAPI)

```bash
cd slingshot-ai
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000 --app-dir .
```

### 2) Frontend (HTML/CSS/JS)

In a separate terminal:

```bash
cd slingshot-ai
python3 -m http.server 5173 --directory frontend
```

Open: `http://127.0.0.1:5173/index.html`

Demo credentials:
- Email: `demo@slingshot.ai`
- Password: `slingshot123`

## 🧠 AMD GPU / ROCm Optimization Notes

The current model uses CPU-based scikit-learn for simplicity.

To enable AMD acceleration:
1. Swap `LinearRegression` for a lightweight PyTorch model in `backend/ml/forecast.py`.
2. Install ROCm-compatible PyTorch build.
3. Move tensors/models to `torch.device("cuda")` (ROCm maps to CUDA API in PyTorch).
4. Keep API contract unchanged so frontend remains compatible.

This design keeps the app hackathon-fast now while remaining architecture-ready for AMD GPU inference/training.

## 📦 GitHub Deployment Notes

- Push entire `slingshot-ai/` directory to a GitHub repo.
- Use GitHub Actions or your preferred host to run `uvicorn` backend and static frontend.
- For demo environments, SQLite is sufficient; for production, replace DB layer with PostgreSQL.
