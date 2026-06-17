export default function RiskFactors({ factors = [] }) {
  if (!factors.length) {
    return <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No significant risk factors detected.</p>
  }

  return (
    <ul className="risk-list">
      {factors.map((f, i) => (
        <li key={i} className="risk-item">
          <span className={`risk-dot ${f.severity}`} />
          {f.factor}
        </li>
      ))}
    </ul>
  )
}
