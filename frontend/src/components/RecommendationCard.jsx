export default function RecommendationCard({ recommendations = [] }) {
  if (!recommendations.length) {
    return <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No recommendations available.</p>
  }

  return (
    <>
      {recommendations.map((rec, i) => (
        <div key={i} className="rec-card">
          <h4>{rec.action}</h4>
          <p><strong>Reason:</strong> {rec.reason}</p>
          <p><strong>Expected Impact:</strong> {rec.expected_impact}</p>
        </div>
      ))}
    </>
  )
}
