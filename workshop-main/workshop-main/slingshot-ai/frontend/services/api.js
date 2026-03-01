const API_BASE = 'http://127.0.0.1:8000';

export async function fetchData() {
  const res = await fetch(`${API_BASE}/data`);
  if (!res.ok) throw new Error('Failed to fetch data');
  return res.json();
}

export async function fetchHealthScore() {
  const res = await fetch(`${API_BASE}/health-score`);
  if (!res.ok) throw new Error('Failed to fetch health score');
  return res.json();
}

export async function predictSales(monthsAhead = 3, csvData = null) {
  const res = await fetch(`${API_BASE}/predict-sales`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ months_ahead: monthsAhead, csv_data: csvData }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Prediction failed');
  }

  return res.json();
}
