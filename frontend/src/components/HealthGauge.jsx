function getColor(score) {
  if (score >= 70) return '#22c55e'
  if (score >= 40) return '#f59e0b'
  return '#ef4444'
}

export default function HealthGauge({ score = 0, label = 'Health Score' }) {
  const pct = Math.min(100, Math.max(0, score)) / 100
  const color = getColor(score)
  const angle = pct * 180
  const rad = (angle - 180) * (Math.PI / 180)
  const x = 80 + 70 * Math.cos(rad)
  const y = 80 + 70 * Math.sin(rad)
  const large = angle > 90 ? 1 : 0

  return (
    <div className="gauge-wrap">
      <svg className="gauge-svg" viewBox="0 0 160 90">
        <path
          d="M 10 80 A 70 70 0 0 1 150 80"
          fill="none"
          stroke="#243049"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d={`M 10 80 A 70 70 0 ${large} 1 ${x} ${y}`}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
        />
      </svg>
      <div className="gauge-score" style={{ color }}>
        {Math.round(score)}
      </div>
      <div className="gauge-label">{label}</div>
    </div>
  )
}
