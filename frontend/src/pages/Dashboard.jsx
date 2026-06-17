import { useEffect, useState } from 'react'
import {
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import KPI from '../components/KPI'
import CustomerTable from '../components/CustomerTable'
import { api } from '../services/api'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.getDashboard()
      .then(setData)
      .catch((e) => setError(e.message))
  }, [])

  if (error) return <div className="error">Failed to load dashboard: {error}</div>
  if (!data) return <div className="loading">Loading dashboard...</div>

  const { kpis, health_distribution, churn_trend, top_risk_customers, model_metrics } = data

  return (
    <>
      <div className="page-header">
        <h2>Executive Dashboard</h2>
        <p>Unified customer health overview across all channels</p>
      </div>

      <div className="kpi-grid">
        <KPI label="Total Customers" value={kpis.total_customers.toLocaleString()} />
        <KPI label="Healthy" value={kpis.healthy_customers} color="#22c55e" />
        <KPI label="Needs Attention" value={kpis.needs_attention} color="#f59e0b" />
        <KPI label="At Risk" value={kpis.at_risk_customers} color="#ef4444" />
        <KPI label="Avg Health Score" value={kpis.avg_health_score} />
        <KPI
          label="Potential Revenue Saved"
          value={`$${kpis.potential_revenue_saved.toLocaleString()}`}
          color="#22c55e"
        />
      </div>

      <div className="chart-grid">
        <div className="card">
          <h3>Health Distribution</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={health_distribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
              >
                {health_distribution.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1a2235', border: '1px solid #243049', borderRadius: 8 }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3>Churn Trend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={churn_trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#243049" />
              <XAxis dataKey="month" stroke="#8b9ab8" fontSize={12} />
              <YAxis stroke="#8b9ab8" fontSize={12} unit="%" />
              <Tooltip
                contentStyle={{ background: '#1a2235', border: '1px solid #243049', borderRadius: 8 }}
              />
              <Line
                type="monotone"
                dataKey="churn_rate"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: '#ef4444' }}
                name="Churn Rate"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {model_metrics && Object.keys(model_metrics).length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3>Churn Model Performance</h3>
          <div className="metrics-row">
            <div className="metric-pill">Accuracy: <strong>{model_metrics.accuracy}%</strong></div>
            <div className="metric-pill">Precision: <strong>{model_metrics.precision}%</strong></div>
            <div className="metric-pill">Recall: <strong>{model_metrics.recall}%</strong></div>
            <div className="metric-pill">F1 Score: <strong>{model_metrics.f1_score}%</strong></div>
          </div>
        </div>
      )}

      <div className="card">
        <h3>Top Risk Customers</h3>
        <CustomerTable customers={top_risk_customers} />
      </div>
    </>
  )
}
