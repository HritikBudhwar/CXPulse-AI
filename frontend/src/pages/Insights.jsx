import { useEffect, useState } from 'react'
import { api } from '../services/api'

export default function Insights() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.getInsights()
      .then(setData)
      .catch((e) => setError(e.message))
  }, [])

  if (error) return <div className="error">{error}</div>
  if (!data) return <div className="loading">Loading insights...</div>

  return (
    <>
      <div className="page-header">
        <h2>AI Insights Center</h2>
        <p>Prioritized actions and opportunities powered by CXPulse intelligence</p>
      </div>

      {data.executive_briefing && (
        <div className="card" style={{
          marginBottom: 24,
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          boxShadow: '0 0 20px rgba(59, 130, 246, 0.15)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 12,
            right: 16,
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            color: 'white',
            fontSize: '0.75rem',
            padding: '2px 8px',
            borderRadius: 12,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            AI Briefing
          </div>
          <h3 style={{
            color: 'var(--text)',
            marginBottom: 8,
            fontSize: '1.1rem',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            ✨ Gemini AI Executive Briefing
          </h3>
          <p style={{
            color: 'var(--text)',
            fontSize: '0.95rem',
            lineHeight: 1.6,
            margin: 0
          }}>
            {data.executive_briefing}
          </p>
        </div>
      )}

      <div className="insights-grid">
        <div className="card">
          <h3>High Risk Customers</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Health</th>
                  <th>Churn Risk</th>
                  <th>Top Risk</th>
                </tr>
              </thead>
              <tbody>
                {data.high_risk_customers.map((c) => (
                  <tr key={c.customer_id}>
                    <td>{c.customer_id}</td>
                    <td>{c.health_score}</td>
                    <td style={{ color: '#ef4444' }}>{c.churn_probability}%</td>
                    <td>{c.top_risk}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3>Upsell Opportunities</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Health</th>
                  <th>Spent</th>
                  <th>Opportunity</th>
                </tr>
              </thead>
              <tbody>
                {data.upsell_opportunities.map((c) => (
                  <tr key={c.customer_id}>
                    <td>{c.customer_id}</td>
                    <td style={{ color: '#22c55e' }}>{c.health_score}</td>
                    <td>${c.total_spent?.toFixed(0)}</td>
                    <td>{c.opportunity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3>Customers Requiring Follow-up</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Reason</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                {data.follow_up_required.map((c) => (
                  <tr key={c.customer_id}>
                    <td>{c.customer_id}</td>
                    <td>{c.reason}</td>
                    <td>
                      <span className={`badge ${c.priority === 'High' ? 'badge-risk' : 'badge-attention'}`}>
                        {c.priority}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3>Priority Recommendations</h3>
          {data.priority_recommendations.map((rec, i) => (
            <div key={i} className="rec-card">
              <h4>{rec.action}</h4>
              <p><strong>For:</strong> {rec.customer_id}</p>
              <p><strong>Reason:</strong> {rec.reason}</p>
              <p><strong>Impact:</strong> {rec.expected_impact}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
