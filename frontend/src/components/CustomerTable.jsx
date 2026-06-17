function statusBadge(status) {
  const map = {
    Healthy: 'badge-healthy',
    'Needs Attention': 'badge-attention',
    'At Risk': 'badge-risk',
  }
  return map[status] || 'badge-attention'
}

export default function CustomerTable({ customers, onSelect, selectedId }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Customer</th>
            <th>Segment</th>
            <th>Health</th>
            <th>Churn Risk</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr
              key={c.customer_id}
              className="clickable"
              onClick={() => onSelect?.(c.customer_id)}
              style={
                selectedId === c.customer_id
                  ? { background: 'var(--surface-2)' }
                  : undefined
              }
            >
              <td>{c.customer_id}</td>
              <td>{c.segment}</td>
              <td>{c.health_score}</td>
              <td>{c.churn_probability}%</td>
              <td>
                <span className={`badge ${statusBadge(c.status)}`}>{c.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
