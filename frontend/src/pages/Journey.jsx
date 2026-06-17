import { useEffect, useState } from 'react'
import { api } from '../services/api'
import {
  Globe,
  Mail,
  ShoppingCart,
  Headphones,
  MessageSquare,
  Smartphone,
  AlertTriangle,
  Clock,
  CheckCircle2
} from 'lucide-react'



// Channel configuration for UI consistency
const CHANNEL_CONFIG = {
  Web: { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.3)', icon: Globe },
  Email: { color: '#a855f7', bg: 'rgba(168, 85, 247, 0.1)', border: 'rgba(168, 85, 247, 0.3)', icon: Mail },
  Purchase: { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.3)', icon: ShoppingCart },
  Support: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)', icon: Headphones },
  Chat: { color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.1)', border: 'rgba(6, 182, 212, 0.3)', icon: MessageSquare },
  Mobile: { color: '#eab308', bg: 'rgba(234, 179, 8, 0.1)', border: 'rgba(234, 179, 8, 0.3)', icon: Smartphone }
}

export default function Journey() {
  const [selectedId, setSelectedId] = useState('C0001')
  const [customer, setCustomer] = useState(null)
  const [allCustomers, setAllCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Active filters - all channel types toggled ON by default
  const [activeFilters, setActiveFilters] = useState({
    Web: true,
    Email: true,
    Purchase: true,
    Support: true,
    Chat: true,
    Mobile: true
  })

  // Load all customers for the finder dropdown list
  useEffect(() => {
    api.getCustomers()
      .then((res) => {
        setAllCustomers(res.customers || [])
      })
      .catch((e) => console.error(e))
  }, [])

  // Load selected customer details
  useEffect(() => {
    setLoading(true)
    api.getCustomer(selectedId)
      .then((res) => {
        setCustomer(res)
        setError(null)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [selectedId])

  const toggleFilter = (channel) => {
    setActiveFilters(prev => ({
      ...prev,
      [channel]: !prev[channel]
    }))
  }

  // Get initials for Avatar
  const getInitials = (id) => {
    if (!id) return 'ID'
    const numPart = id.replace(/^[A-Za-z]+0*/, '')
    return `C${numPart || '0'}`
  }

  if (error) return <div className="error">{error}</div>

  // Filter events based on active filters
  const filteredEvents = customer?.journey?.filter(event => {
    const channelKey = event.channel === 'System' || event.channel === 'Account' ? 'Web' : event.channel
    return activeFilters[channelKey] !== false
  }) || []

  return (
    <div style={{ padding: '0 8px' }}>
      {/* 1. Breadcrumbs and Top Level Warning Stats Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
        letterSpacing: '0.05em',
        textTransform: 'uppercase'
      }}>
        <div>
          <span style={{ color: 'var(--text-muted)', opacity: 0.6 }}>cxpulse</span>
          <span style={{ margin: '0 8px', color: 'var(--text-muted)' }}>&gt;</span>
          <span style={{ color: 'var(--text)', fontWeight: 600 }}>journey</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            border: '1px solid rgba(239, 68, 68, 0.4)',
            background: 'rgba(239, 68, 68, 0.08)',
            color: '#f87171',
            padding: '3px 10px',
            borderRadius: 6,
            fontSize: '0.75rem',
            fontWeight: 700
          }}>
            <AlertTriangle size={12} />
            3 HIGH RISK
          </div>
          <div style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Q2 2026</div>
        </div>
      </div>

      {/* 2. Wide and Prominent Customer Selector Dropdown */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        marginBottom: 24,
        borderBottom: '1px solid var(--border)',
        paddingBottom: 20,
        flexWrap: 'wrap'
      }}>
        <div style={{
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          fontWeight: 700,
          letterSpacing: '0.05em',
          textTransform: 'uppercase'
        }}>
          SELECT CUSTOMER ID &mdash;
        </div>
        <div style={{ flex: 1, minWidth: 280, maxWidth: 500 }}>
          <select
            value={selectedId}
            onChange={(e) => {
              if (e.target.value) {
                setSelectedId(e.target.value)
              }
            }}
            style={{
              width: '100%',
              padding: '10px 16px',
              borderRadius: 8,
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              fontSize: '0.9rem',
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer',
              transition: 'border-color 0.2s ease'
            }}
          >
            {allCustomers.map((c) => (
              <option key={c.customer_id} value={c.customer_id}>
                {c.customer_id} &mdash; {c.segment} Segment (Health Score: {c.health_score})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          Loading unified customer story...
        </div>
      )}

      {/* 3. Customer Info Profile Card */}
      {!loading && customer && (
        <>
          <div className="card" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 20,
            marginBottom: 24,
            padding: '20px 24px',
            background: 'var(--surface-1)',
            border: '1px solid var(--border)',
            borderRadius: 12
          }}>
            {/* Left Name and Avatar details */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                border: '2px solid #ec4899',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f472b6',
                fontWeight: 700,
                fontSize: '1.1rem',
                background: 'rgba(236, 72, 153, 0.1)'
              }}>
                {getInitials(customer.customer_id)}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)' }}>
                  {customer.customer_id} &middot; {customer.segment}
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Segment Tier &middot; {customer.mrr}
                </p>
              </div>
            </div>

            {/* Health, Risk, Satisfaction Stats */}
            <div style={{ display: 'flex', gap: 32 }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Health</div>
                <div style={{
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  color: customer.health_score < 40 ? '#ef4444' : customer.health_score < 70 ? '#f59e0b' : '#22c55e'
                }}>
                  {customer.health_score}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Churn Risk</div>
                <div style={{
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  color: customer.churn_probability > 60 ? '#ef4444' : customer.churn_probability > 30 ? '#f59e0b' : '#22c55e'
                }}>
                  {customer.churn_probability}%
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Satisfaction</div>
                <div style={{
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  color: parseInt(customer.satisfaction) < 40 ? '#ef4444' : '#22c55e'
                }}>
                  {customer.satisfaction}
                </div>
              </div>
            </div>

            {/* Filter pills toggles */}
            <div style={{
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap'
            }}>
              {Object.keys(CHANNEL_CONFIG).map((channel) => {
                const conf = CHANNEL_CONFIG[channel]
                const Icon = conf.icon
                const isActive = activeFilters[channel]
                return (
                  <button
                    key={channel}
                    onClick={() => toggleFilter(channel)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '5px 12px',
                      borderRadius: 6,
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      background: isActive ? conf.bg : 'transparent',
                      border: isActive ? `1px solid ${conf.color}` : '1px solid var(--border)',
                      color: isActive ? conf.color : 'var(--text-muted)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Icon size={12} />
                    {channel}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 4. Timeline Section */}
          <div className="card" style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: '24px 32px',
            marginBottom: 24
          }}>
            <h4 style={{
              margin: '0 0 24px 0',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}>
              OMNICHANNEL INTERACTION TIMELINE
            </h4>

            {filteredEvents.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', padding: '24px 0', textAlign: 'center' }}>
                No interaction events match active channel filters.
              </p>
            ) : (
              <div style={{
                position: 'relative',
                paddingLeft: 20
              }}>
                {/* Timeline vertical bar */}
                <div style={{
                  position: 'absolute',
                  left: 62,
                  top: 10,
                  bottom: 10,
                  width: 2,
                  background: 'var(--border)'
                }} />

                {filteredEvents.map((evt, idx) => {
                  const chan = evt.channel === 'System' || evt.channel === 'Account' ? 'Web' : evt.channel
                  const conf = CHANNEL_CONFIG[chan] || CHANNEL_CONFIG.Web
                  const IconComp = conf.icon
                  
                  return (
                    <div key={idx} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      marginBottom: 16,
                      position: 'relative'
                    }}>
                      {/* Left Date Block */}
                      <div style={{
                        width: 50,
                        textAlign: 'right',
                        marginRight: 24,
                        flexShrink: 0,
                        paddingTop: 8
                      }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)' }}>
                          {evt.date}
                        </div>
                        {evt.time && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                            {evt.time}
                          </div>
                        )}
                      </div>

                      {/* Icon Circle */}
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: conf.bg,
                        border: `1px solid ${conf.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: conf.color,
                        zIndex: 2,
                        flexShrink: 0,
                        marginRight: 20
                      }}>
                        <IconComp size={14} />
                      </div>

                      {/* Event bubble container */}
                      <div style={{
                        flex: 1,
                        background: 'var(--surface-2)',
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        padding: '12px 20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div>
                          <span style={{
                            display: 'inline-block',
                            background: conf.bg,
                            border: `1px solid ${conf.border}`,
                            color: conf.color,
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: 4,
                            textTransform: 'uppercase',
                            marginRight: 12,
                            letterSpacing: '0.05em'
                          }}>
                            {chan}
                          </span>
                          <span style={{
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            color: 'var(--text)'
                          }}>
                            {evt.event_title || evt.event}
                          </span>
                          <p style={{
                            margin: '4px 0 0 0',
                            fontSize: '0.85rem',
                            color: 'var(--text-muted)'
                          }}>
                            {evt.description || evt.event}
                          </p>
                        </div>

                        {/* Status Icon on Right side */}
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {evt.status === 'warning' && (
                            <AlertTriangle size={16} color="#ef4444" />
                          )}
                          {evt.status === 'clock' && (
                            <Clock size={16} color="#eab308" />
                          )}
                          {evt.status === 'success' && (
                            <CheckCircle2 size={16} color="#22c55e" />
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* 5. Footer summary boxes */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 16
          }}>
            {/* Website Stats Box */}
            <div style={{
              background: 'var(--surface-1)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: 16,
              borderLeft: '4px solid #3b82f6'
            }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Globe size={12} color="#3b82f6" />
                Website
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)', marginTop: 8 }}>
                {customer.website_sessions}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                total sessions
              </div>
            </div>

            {/* Email Stats Box */}
            <div style={{
              background: 'var(--surface-1)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: 16,
              borderLeft: '4px solid #a855f7'
            }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Mail size={12} color="#a855f7" />
                Email
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)', marginTop: 8 }}>
                {Math.round(customer.emails_opened / (customer.emails_sent || 1) * 100)}%
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                open rate
              </div>
            </div>

            {/* Purchases Stats Box */}
            <div style={{
              background: 'var(--surface-1)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: 16,
              borderLeft: '4px solid #22c55e'
            }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShoppingCart size={12} color="#22c55e" />
                Purchases
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)', marginTop: 8 }}>
                {customer.orders_count || 12}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                total orders
              </div>
            </div>

            {/* Support Stats Box */}
            <div style={{
              background: 'var(--surface-1)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: 16,
              borderLeft: '4px solid #ef4444'
            }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Headphones size={12} color="#ef4444" />
                Support
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)', marginTop: 8 }}>
                {customer.support_tickets}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                active tickets
              </div>
            </div>

            {/* Live Chat Stats Box */}
            <div style={{
              background: 'var(--surface-1)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: 16,
              borderLeft: '4px solid #06b6d4'
            }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <MessageSquare size={12} color="#06b6d4" />
                Live Chat
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)', marginTop: 8 }}>
                {customer.sentiment_score < 0.4 ? 'Negative' : customer.sentiment_score < 0.7 ? 'Neutral' : 'Positive'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                recent sentiment
              </div>
            </div>

            {/* Mobile Stats Box */}
            <div style={{
              background: 'var(--surface-1)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: 16,
              borderLeft: '4px solid #eab308'
            }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Smartphone size={12} color="#eab308" />
                Mobile
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)', marginTop: 8 }}>
                {Math.max(2, Math.round(customer.avg_session_duration / 3))}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                sessions this week
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
