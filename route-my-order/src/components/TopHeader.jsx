import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { LogOut, User } from 'lucide-react'

export function TopHeader() {
  const { user, logout } = useAuth()
  const [showConfirm, setShowConfirm] = useState(false)

  if (!user) return null

  return (
    <header className="app-header">
      <div className="header-brand">
        <img 
          src="https://halamama.com/cdn/shop/files/halamama_green.svg" 
          alt="HalaMama" 
          className="header-logo-img" 
        />
      </div>
      
      <div className="header-user">
        <div className="text-right">
          <div className="header-name">{user.name}</div>
          <div className="header-role">{user.role}</div>
        </div>
        <div className="header-avatar">
          {user.name.charAt(0)}
        </div>
        
        {showConfirm ? (
          <div className="logout-confirm-group" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button 
              onClick={logout} 
              className="logout-confirm-btn confirm"
              title="Confirm Logout"
            >
              Log out
            </button>
            <button 
              onClick={() => setShowConfirm(false)} 
              className="logout-confirm-btn cancel"
              title="Cancel"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button onClick={() => setShowConfirm(true)} className="header-logout" aria-label="Logout">
            <LogOut size={16} />
          </button>
        )}
      </div>
    </header>
  )
}
