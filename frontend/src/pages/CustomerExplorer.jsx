import { useEffect, useState, useCallback } from 'react'
import CustomerTable from '../components/CustomerTable'
import HealthGauge from '../components/HealthGauge'
import RiskFactors from '../components/RiskFactors'
import RecommendationCard from '../components/RecommendationCard'
import JourneyTimeline from '../components/JourneyTimeline'
import { api } from '../services/api'

export default function CustomerExplorer() {
  const [customers, setCustomers] = useState([])
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadCustomers = useCallback(() => {
    setLoading(true)
    api.getCustomers(search, status)
      .then((res) => setCustomers(res.customers))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [search, status])

  useEffect(() => {
    const timer = setTimeout(loadCustomers, 300)
    return () => clearTimeout(timer)
  }, [loadCustomers])

  const selectCustomer = (id) => {
    api.getCustomer(id)
      .then(setSelected)
      .catch((e) => setError(e.message))
  }

  useEffect(() => {
    if (customers.length && !selected) {
      selectCustomer(customers[0].customer_id)
    }
  }, [customers])

  if (error) return <div className="error">{error}</div>

  return (
    <>
      <div className="page-header">
        <h2>Customer Explorer</h2>
        <p>Investigate individual customers and their health signals</p>
      </div>

      <div className="search-bar">
        <input
          placeholder="Search by customer ID or segment..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="Healthy">Healthy</option>
          <option value="Needs Attention">Needs Attention</option>
          <option value="At Risk">At Risk</option>
        </select>
      </div>

      <div className="explorer-layout">
        <div className="card">
          <h3>Customers ({customers.length})</h3>
          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <CustomerTable
              customers={customers}
              onSelect={selectCustomer}
              selectedId={selected?.customer_id}
            />
          )}
        </div>

        {selected && (
          <div>
            <div className="card" style={{ marginBottom: 20 }}>
              <h3>Customer Profile — {selected.customer_id}</h3>
              <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                <HealthGauge score={selected.health_score} />
                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ef4444' }}>
                    {selected.churn_probability}% Churn Risk
                  </div>
                  <div style={{ color: 'var(--text-muted)', marginTop: 4 }}>
                    Status: <strong>{selected.status}</strong>
                  </div>
                </div>
              </div>
              <div className="profile-grid">
                <div className="profile-item">
                  <div className="label">Segment</div>
                  <div className="val">{selected.segment}</div>
                </div>
                <div className="profile-item">
                  <div className="label">Age / Gender</div>
                  <div className="val">{selected.age} / {selected.gender}</div>
                </div>
                <div className="profile-item">
                  <div className="label">Total Spent</div>
                  <div className="val">${selected.total_spent?.toFixed(2)}</div>
                </div>
                <div className="profile-item">
                  <div className="label">Orders</div>
                  <div className="val">{selected.orders_count}</div>
                </div>
                <div className="profile-item">
                  <div className="label">Website Sessions</div>
                  <div className="val">{selected.website_sessions}</div>
                </div>
                <div className="profile-item">
                  <div className="label">Email Open Rate</div>
                  <div className="val">{(selected.email_open_rate * 100).toFixed(0)}%</div>
                </div>
              </div>
            </div>

            <div className="card" style={{ marginBottom: 20 }}>
              <h3>Risk Factors</h3>
              <RiskFactors factors={selected.risk_factors} />
            </div>

            <div className="card" style={{ marginBottom: 20 }}>
              <h3>AI Recommendations</h3>
              <RecommendationCard recommendations={selected.recommendations} customerId={selected.customer_id} />
            </div>

            <div className="card">
              <h3>Omnichannel Journey</h3>
              <JourneyTimeline events={selected.journey} />
            </div>
          </div>
        )}
      </div>
    </>
  )
}
