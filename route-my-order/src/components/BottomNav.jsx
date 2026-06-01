import { NavLink } from 'react-router-dom'
import { LayoutDashboard, History, User } from 'lucide-react'

export function BottomNav() {
  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        <NavLink 
          to="/" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          end
        >
          <LayoutDashboard size={22} strokeWidth={2.5} />
          <span>Active</span>
        </NavLink>
        
        <NavLink 
          to="/history" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <History size={22} strokeWidth={2.5} />
          <span>History</span>
        </NavLink>
        
        <NavLink 
          to="/profile" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <User size={22} strokeWidth={2.5} />
          <span>Profile</span>
        </NavLink>
      </div>
    </nav>
  )
}
