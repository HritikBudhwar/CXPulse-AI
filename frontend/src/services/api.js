const API_BASE = '/api'

async function fetchJSON(path) {
  const res = await fetch(`${API_BASE}${path}`)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export const api = {
  getDashboard: () => fetchJSON('/dashboard'),
  getCustomers: (search = '', status = '') => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (status) params.set('status', status)
    const qs = params.toString()
    return fetchJSON(`/customers${qs ? `?${qs}` : ''}`)
  },
  getCustomer: (id) => fetchJSON(`/customers/${id}`),
  getInsights: () => fetchJSON('/insights'),
  simulate: (payload) =>
    fetch(`${API_BASE}/simulator`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then((r) => {
      if (!r.ok) throw new Error(`API error: ${r.status}`)
      return r.json()
    }),
  generateEmail: (payload) =>
    fetch(`${API_BASE}/generate_email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then((r) => {
      if (!r.ok) throw new Error(`API error: ${r.status}`)
      return r.json()
    }),
}
