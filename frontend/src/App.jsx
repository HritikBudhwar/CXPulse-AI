import { NavLink, Routes, Route, Navigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Lightbulb,
  FlaskConical,
  Route as RouteIcon,
  Activity,
} from 'lucide-react'
import Dashboard from './pages/Dashboard'
import CustomerExplorer from './pages/CustomerExplorer'
import Insights from './pages/Insights'
import Simulator from './pages/Simulator'
import Journey from './pages/Journey'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/customers', label: 'Customer Explorer', icon: Users },
  { to: '/journey', label: 'Omnichannel Journey', icon: RouteIcon },
  { to: '/insights', label: 'AI Insights', icon: Lightbulb },
  { to: '/simulator', label: 'Impact Simulator', icon: FlaskConical },
]

export default function App() {
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Activity size={28} color="#3b82f6" />
          <div>
            <h1>CXPulse AI</h1>
            <span>Customer Health Platform</span>
          </div>
        </div>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </aside>
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/customers" element={<CustomerExplorer />} />
          <Route path="/journey" element={<Journey />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/simulator" element={<Simulator />} />
        </Routes>
      </main>
    </div>
  )
}
