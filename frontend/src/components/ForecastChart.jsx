import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

export default function ForecastChart({ history, forecast }) {
  const labels = [
    ...history.map((h) => h.month),
    ...forecast.map((f) => `M+${f.month_index - history.length}`)
  ]

  const historySeries = [...history.map((h) => h.revenue), ...forecast.map(() => null)]
  const forecastSeries = [
    ...history.map(() => null),
    ...forecast.map((f) => f.predicted_revenue)
  ]

  const data = {
    labels,
    datasets: [
      {
        label: 'Historical Revenue',
        data: historySeries,
        borderColor: '#27d980',
        tension: 0.3
      },
      {
        label: 'Predicted Revenue',
        data: forecastSeries,
        borderColor: '#ffb020',
        borderDash: [6, 4],
        tension: 0.3
      }
    ]
  }

  return (
    <div className="card">
      <h3>Forecast vs Historical</h3>
      <Line data={data} />
    </div>
  )
}
