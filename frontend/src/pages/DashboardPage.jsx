import DataUploader from '../components/DataUploader'
import ForecastChart from '../components/ForecastChart'
import GrowthAssistant from '../components/GrowthAssistant'
import MetricCard from '../components/MetricCard'
import RevenueChart from '../components/RevenueChart'

export default function DashboardPage({ loading, kpis, data, forecast, onUploaded }) {
  return (
    <>
      <DataUploader onUploaded={onUploaded} />
      {loading ? (
        <p>Loading dashboard...</p>
      ) : (
        <>
          <section className="kpi-grid">
            {kpis.map((metric) => (
              <MetricCard key={metric.title} {...metric} />
            ))}
          </section>

          <section className="grid-2">
            <RevenueChart data={data} />
            <ForecastChart history={data} forecast={forecast} />
          </section>

          <GrowthAssistant />
        </>
      )}
    </>
  )
}
