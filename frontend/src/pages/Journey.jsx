import { useEffect, useState } from 'react'
import JourneyTimeline from '../components/JourneyTimeline'
import HealthGauge from '../components/HealthGauge'
import { api } from '../services/api'

export default function Journey() {
  const [customers, setCustomers] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [customer, setCustomer] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.getCustomers()
      .then((res) => {
        const atRisk = res.customers.filter((c) => c.status === 'At Risk')
        const list = atRisk.length ? atRisk : res.customers
        setCustomers(list)
        if (list.length) {
          setSelectedId(list[0].customer_id)
        }
      })
      .catch((e) => setError(e.message))
  }, [])

  useEffect(() => {
    if (!selectedId) return
    api.getCustomer(selectedId)
      .then(setCustomer)
      .catch((e) => setError(e.message))
  }, [selectedId])

  if (error) return <div className="error">{error}</div>

  return (
    <>
      <div className="page-header">
        <h2>Omnichannel Journey</h2>
        <p>Cross-channel customer story — website, email, purchases, and support unified</p>
      </div>

      <div className="search-bar">
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          style={{ flex: 1 }}
        >
          {customers.map((c) => (
            <option key={c.customer_id} value={c.customer_id}>
              {c.customer_id} — {c.segment} (Health: {c.health_score})
            </option>
          ))}
        </select>
      </div>

      {customer ? (
        <div className="explorer-layout">
          <div className="card">
            <h3>Customer Summary</h3>
            <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginBottom: 20 }}>
              <HealthGauge score={customer.health_score} />
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{customer.customer_id}</div>
                <div style={{ color: 'var(--text-muted)' }}>{customer.segment} · Age {customer.age}</div>
                <div style={{ marginTop: 8, color: '#ef4444', fontWeight: 600 }}>
                  {customer.churn_probability}% churn probability
                </div>
              </div>
            </div>
            <div className="profile-grid">
              <div className="profile-item">
                <div className="label">Website Sessions</div>
                <div className="val">{customer.website_sessions}</div>
              </div>
              <div className="profile-item">
                <div className="label">Emails Opened</div>
                <div className="val">{customer.emails_opened}/{customer.emails_sent}</div>
              </div>
              <div className="profile-item">
                <div className="label">Support Tickets</div>
                <div className="val">{customer.support_tickets}</div>
              </div>
              <div className="profile-item">
                <div className="label">Total Spent</div>
                <div className="val">${customer.total_spent?.toFixed(2)}</div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3>Interaction Timeline</h3>
            <JourneyTimeline events={customer.journey} />
          </div>
        </div>
      ) : (
        <div className="loading">Loading journey...</div>
      )}
    </>
  )
}
