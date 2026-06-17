import { useEffect, useState } from 'react'
import {
  BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts'
import { api } from '../services/api'

function Toggle({ on, onChange }) {
  return (
    <button
      type="button"
      className={`toggle${on ? ' on' : ''}`}
      onClick={() => onChange(!on)}
      aria-pressed={on}
    />
  )
}

export default function Simulator() {
  const [customers, setCustomers] = useState([])
  const [customerId, setCustomerId] = useState('')
  const [discount, setDiscount] = useState(15)
  const [supportCallback, setSupportCallback] = useState(false)
  const [loyaltyBonus, setLoyaltyBonus] = useState(false)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.getCustomers('', 'At Risk')
      .then((res) => {
        const list = res.customers.length ? res.customers : []
        if (!list.length) {
          return api.getCustomers().then((r) => {
            setCustomers(r.customers)
            if (r.customers.length) setCustomerId(r.customers[0].customer_id)
          })
        }
        setCustomers(list)
        setCustomerId(list[0].customer_id)
      })
      .catch((e) => setError(e.message))
  }, [])

  const runSimulation = () => {
    if (!customerId) return
    setLoading(true)
    setError(null)
    api.simulate({
      customer_id: customerId,
      discount_pct: discount,
      support_callback: supportCallback,
      loyalty_bonus: loyaltyBonus,
    })
      .then(setResult)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (customerId) runSimulation()
  }, [customerId])

  return (
    <>
      <div className="page-header">
        <h2>Impact Simulator</h2>
        <p>Test interventions before execution — see predicted churn reduction and revenue impact</p>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="simulator-layout">
        <div className="card">
          <h3>Intervention Controls</h3>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Customer</label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              style={{
                width: '100%',
                marginTop: 6,
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '10px 14px',
                color: 'var(--text)',
              }}
            >
              {customers.map((c) => (
                <option key={c.customer_id} value={c.customer_id}>
                  {c.customer_id} — Churn {c.churn_probability}%
                </option>
              ))}
            </select>
          </div>

          <div className="slider-group">
            <label>
              <span>Discount</span>
              <span>{discount}%</span>
            </label>
            <input
              type="range"
              min={0}
              max={30}
              step={5}
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
            />
          </div>

          <div className="toggle-group">
            <span>Priority Support Callback</span>
            <Toggle on={supportCallback} onChange={setSupportCallback} />
          </div>

          <div className="toggle-group">
            <span>Loyalty Reward Bonus</span>
            <Toggle on={loyaltyBonus} onChange={setLoyaltyBonus} />
          </div>

          <button
            className="btn-primary"
            onClick={runSimulation}
            disabled={loading}
            style={{ marginTop: 20, width: '100%' }}
          >
            {loading ? 'Simulating...' : 'Run Simulation'}
          </button>
        </div>

        <div className="card">
          <h3>Simulation Results</h3>
          {result ? (
            <div className="sim-result">
              <div className="sim-compare">
                <div className="sim-risk">
                  <div className="num" style={{ color: '#ef4444' }}>
                    {result.current_churn_risk}%
                  </div>
                  <div className="lbl">Current Risk</div>
                </div>
                <div className="sim-arrow">→</div>
                <div className="sim-risk">
                  <div className="num" style={{ color: '#22c55e' }}>
                    {result.predicted_churn_risk}%
                  </div>
                  <div className="lbl">After Intervention</div>
                </div>
              </div>

              <div style={{ height: 160, marginTop: 24, marginBottom: 24 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: 'Current Risk', value: result.current_churn_risk, color: '#ef4444' },
                      { name: 'After Intervention', value: result.predicted_churn_risk, color: '#22c55e' }
                    ]}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <XAxis dataKey="name" stroke="#8b9ab8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#8b9ab8" fontSize={11} domain={[0, 100]} unit="%" tickLine={false} />
                    <Tooltip
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ background: '#1a2235', border: '1px solid #243049', borderRadius: 8 }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={50}>
                      <Cell fill="#ef4444" />
                      <Cell fill="#22c55e" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Risk reduced by <strong style={{ color: '#22c55e' }}>{result.risk_reduction}%</strong>
              </div>

              <div className="revenue-saved">
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Estimated Revenue Saved
                </div>
                <div className="amount">${result.revenue_saved?.toLocaleString()}</div>
              </div>
            </div>
          ) : (
            <div className="loading">Select a customer and run simulation</div>
          )}
        </div>
      </div>
    </>
  )
}
