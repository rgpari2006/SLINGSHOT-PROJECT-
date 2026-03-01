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

export default function RevenueChart({ data }) {
  const labels = data.map((row) => row.month)

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Revenue',
        data: data.map((row) => row.revenue),
        borderColor: '#4c6fff',
        backgroundColor: 'rgba(76, 111, 255, 0.2)',
        tension: 0.3,
        fill: true
      }
    ]
  }

  return (
    <div className="card">
      <h3>Revenue Trend</h3>
      <Line data={chartData} />
    </div>
  )
}
