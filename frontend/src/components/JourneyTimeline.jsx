export default function JourneyTimeline({ events = [] }) {
  if (!events.length) {
    return <p style={{ color: 'var(--text-muted)' }}>No journey data available.</p>
  }

  return (
    <div className="timeline">
      {events.map((e, i) => (
        <div key={i} className="timeline-item">
          <div className="timeline-dot" />
          <div className="timeline-date">{e.date}</div>
          <div className="timeline-event">{e.event}</div>
          <div className="timeline-channel">{e.channel}</div>
        </div>
      ))}
    </div>
  )
}
