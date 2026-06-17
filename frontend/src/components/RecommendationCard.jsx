import { useState } from 'react'
import { api } from '../services/api'

export default function RecommendationCard({ recommendations = [], customerId }) {
  const [loading, setLoading] = useState(false)
  const [draft, setDraft] = useState(null)
  const [error, setError] = useState(null)

  if (!recommendations.length) {
    return <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No recommendations available.</p>
  }

  const handleGenerateEmail = (action, reason) => {
    setLoading(true)
    setError(null)
    setDraft(null)
    api.generateEmail({ customer_id: customerId, action, reason })
      .then((res) => setDraft(res.email))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  return (
    <>
      <div className="rec-list" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {recommendations.map((rec, i) => (
          <div key={i} className="rec-card" style={{ position: 'relative' }}>
            <h4>{rec.action}</h4>
            <p><strong>Reason:</strong> {rec.reason}</p>
            <p><strong>Expected Impact:</strong> {rec.expected_impact}</p>
            
            <button
              className="btn-primary"
              style={{
                marginTop: 12,
                padding: '6px 12px',
                fontSize: '0.8rem',
                borderRadius: 6,
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
              onClick={() => handleGenerateEmail(rec.action, rec.reason)}
            >
              ✉️ Draft AI Email
            </button>
          </div>
        ))}
      </div>

      {(loading || draft || error) && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: 24
        }}>
          <div className="card" style={{
            maxWidth: 600,
            width: '100%',
            background: 'var(--surface-1)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
            padding: 24
          }}>
            <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              ✨ Gemini AI Re-engagement Draft
            </h3>
            
            {loading && (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                <div className="spinner" style={{
                  width: 32,
                  height: 32,
                  border: '3px solid var(--border)',
                  borderTopColor: '#3b82f6',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 16px'
                }} />
                Drafting highly personalized outreach email...
              </div>
            )}

            {error && (
              <div className="error" style={{ margin: '20px 0' }}>
                Failed to generate draft: {error}
              </div>
            )}

            {draft && (
              <div style={{ marginTop: 16 }}>
                <textarea
                  readOnly
                  value={draft}
                  style={{
                    width: '100%',
                    height: 250,
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    padding: 14,
                    color: 'var(--text)',
                    fontFamily: 'monospace',
                    fontSize: '0.9rem',
                    resize: 'none'
                  }}
                />
                
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 16 }}>
                  <button
                    className="btn-secondary"
                    onClick={() => {
                      navigator.clipboard.writeText(draft)
                      alert('Copied to clipboard!')
                    }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 8,
                      background: 'var(--surface-3)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                      cursor: 'pointer'
                    }}
                  >
                    📋 Copy Draft
                  </button>
                  <button
                    className="btn-primary"
                    onClick={() => setDraft(null)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 8,
                      background: '#3b82f6',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                <button
                  className="btn-primary"
                  onClick={() => setError(null)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    background: '#3b82f6',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
