import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { Login } from './pages/Login'
import { TopHeader } from './components/TopHeader'
import { BottomNav } from './components/BottomNav'
import './pages/picker/picker.css'
import './pages/packer/packer.css'
import './pages/driver/driver.css'

// Role Dashboards
import { PickerDashboard } from './pages/picker/PickerDashboard'
import { PackerDashboard } from './pages/packer/PackerDashboard'
import { DriverDashboard } from './pages/driver/DriverDashboard'
import { PickerHistory } from './pages/picker/PickerHistory'
import { PackerHistory } from './pages/packer/PackerHistory'
import { DriverHistory } from './pages/driver/DriverHistory'

function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <div className="page"><div className="card">Unauthorized Access</div></div>
  }
  return children
}

function RoleRouter() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />

  switch (user.role) {
    case 'picker': return <PickerDashboard />
    case 'packer': return <PackerDashboard />
    case 'driver': return <DriverDashboard />
    default: return <div>Unknown role</div>
  }
}

function getThemeClass(role) {
  switch (role) {
    case 'picker': return 'theme-picker'
    case 'packer': return 'theme-packer'
    case 'driver': return 'theme-driver'
    default: return ''
  }
}

export default function App() {
  const { user } = useAuth()

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    )
  }

  const themeClass = getThemeClass(user.role)
  const badgeClass = themeClass ? `${user.role === 'picker' ? 'picker' : user.role === 'packer' ? 'packer' : 'driver'}-tab-badge` : 'badge badge-primary'

  return (
    <div className={themeClass} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TopHeader />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/" element={<RoleRouter />} />
          
          <Route path="/history" element={
            user.role === 'picker' ? (
              <PickerHistory />
            ) : user.role === 'packer' ? (
              <PackerHistory />
            ) : user.role === 'driver' ? (
              <DriverHistory />
            ) : (
              <div className="page">
                <h1 className="page-title">History</h1>
                <div className="card mt-4">No recent history</div>
              </div>
            )
          } />
          
          <Route path="/profile" element={
            <div className="page">
              <h1 className="page-title">Profile</h1>
              <div className="card mt-4">
                <div className="stack">
                  <div><strong>Name:</strong> {user.name}</div>
                  <div><strong>Email:</strong> {user.email}</div>
                  <div>
                    <strong>Role:</strong>{' '}
                    <span className={badgeClass}>
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          } />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  )
}
