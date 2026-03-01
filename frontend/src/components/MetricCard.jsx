export default function MetricCard({ title, value, subtitle }) {
  return (
    <div className="card metric-card">
      <p className="metric-title">{title}</p>
      <h2>{value}</h2>
      {subtitle && <small>{subtitle}</small>}
    </div>
  )
}
