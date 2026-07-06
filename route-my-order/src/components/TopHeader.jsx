import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { LogOut, ChevronDown } from 'lucide-react'

export function TopHeader() {
  const { user, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!isMenuOpen) return
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [isMenuOpen])

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
      
      <div className="header-user-container" ref={menuRef}>
        <button 
          className="header-user-trigger" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-expanded={isMenuOpen}
        >
          <div className="header-user-text">
            <span className="header-name">{user.name}</span>
            <span className="header-role">{user.role}</span>
          </div>
          <div className="header-avatar">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <ChevronDown size={14} className={`header-chevron ${isMenuOpen ? 'open' : ''}`} />
        </button>

        {isMenuOpen && (
          <div className="header-dropdown-menu">
            <div className="dropdown-header">
              <div className="dropdown-avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="dropdown-user-details">
                <div className="dropdown-name">{user.name}</div>
                <div className="dropdown-email">{user.email || `${user.role}@halamama.com`}</div>
              </div>
            </div>
            
            <div className="dropdown-divider"></div>
            
            <button 
              onClick={() => {
                setIsMenuOpen(false)
                setShowLogoutConfirm(true)
              }} 
              className="dropdown-item logout-item"
            >
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          </div>
        )}
      </div>

      {showLogoutConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 className="modal-title">Confirm Logout</h3>
            <p className="modal-desc">Are you sure you want to log out?</p>
            <div className="modal-actions">
              <button 
                className="btn btn-outline" 
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger" 
                onClick={() => {
                  setShowLogoutConfirm(false)
                  logout()
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
