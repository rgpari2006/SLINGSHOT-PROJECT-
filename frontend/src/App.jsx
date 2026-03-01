import { useEffect, useMemo, useState } from 'react'

import DashboardPage from './pages/DashboardPage'
import { fetchData, fetchHealthScore, predictSales } from './services/api'

export default function App() {
  const [data, setData] = useState([])
  const [forecast, setForecast] = useState([])
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshDashboard = async () => {
    setLoading(true)
    try {
      const [dataset, predictionRes, healthRes] = await Promise.all([
        fetchData(),
        predictSales({ future_months: 4, marketing_growth: 0.04 }),
        fetchHealthScore()
      ])
      setData(dataset)
      setForecast(predictionRes.predictions)
      setHealth(healthRes)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshDashboard()
  }, [])

  const kpis = useMemo(() => {
    if (!data.length || !health) return []
    const latestRevenue = data[data.length - 1]?.revenue || 0
    const avgRetention = data.reduce((sum, row) => sum + row.retention, 0) / data.length
    const nextPrediction = forecast[0]?.predicted_revenue || 0

    return [
      { title: 'Latest Revenue', value: `$${latestRevenue.toLocaleString()}` },
      { title: 'Next Month Prediction', value: `$${nextPrediction.toLocaleString()}` },
      { title: 'Avg Retention', value: `${avgRetention.toFixed(1)}%` },
      { title: 'Health Score', value: `${health.score}/100` }
    ]
  }, [data, forecast, health])

  return (
    <main className="app-shell">
      <header>
        <h1>Slingshot AI</h1>
        <p>AI-Powered Startup Growth Intelligence Platform</p>
      </header>

      <DashboardPage
        loading={loading}
        kpis={kpis}
        data={data}
        forecast={forecast}
        onUploaded={refreshDashboard}
      />
    </main>
  )
}
