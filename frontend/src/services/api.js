const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

export async function fetchData() {
  const res = await fetch(`${API_BASE}/data`)
  if (!res.ok) throw new Error('Failed to fetch data')
  return res.json()
}

export async function fetchHealthScore() {
  const res = await fetch(`${API_BASE}/health-score`)
  if (!res.ok) throw new Error('Failed to fetch health score')
  return res.json()
}

export async function predictSales(payload = { future_months: 4, marketing_growth: 0.03 }) {
  const res = await fetch(`${API_BASE}/predict-sales`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!res.ok) throw new Error('Failed to predict sales')
  return res.json()
}

export async function uploadCsv(file) {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`${API_BASE}/data/upload`, {
    method: 'POST',
    body: formData
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || 'Upload failed')
  }
  return res.json()
}
