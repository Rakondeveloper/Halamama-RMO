import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

/* Mock user database — will be replaced by POST /login */
const MOCK_USERS = {
  'picker@rmo.qa':   { id: '1', name: 'Ahmed Khalil',   email: 'picker@rmo.qa',  role: 'picker',  password: 'picker123' },
  'packer@rmo.qa':   { id: '2', name: 'Sara Al-Thani',  email: 'packer@rmo.qa',  role: 'packer',  password: 'packer123' },
  'driver@rmo.qa':   { id: '3', name: 'Omar Farooq',    email: 'driver@rmo.qa',  role: 'driver',  password: 'driver123' },
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('rmo_user')
    return saved ? JSON.parse(saved) : null
  })
  const [token, setToken] = useState(() => localStorage.getItem('rmo_token'))

  const login = useCallback(async (email, password) => {
    /* ─── API HOOK: Replace with POST /api/login { email, password } ─── */
    await new Promise(r => setTimeout(r, 800)) // simulate latency
    const u = MOCK_USERS[email.toLowerCase()]
    if (!u || u.password !== password) throw new Error('Invalid credentials')
    const fakeToken = 'tok_' + Math.random().toString(36).slice(2)
    const profile = { id: u.id, name: u.name, email: u.email, role: u.role }
    localStorage.setItem('rmo_user', JSON.stringify(profile))
    localStorage.setItem('rmo_token', fakeToken)
    setUser(profile)
    setToken(fakeToken)
    return profile
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('rmo_user')
    localStorage.removeItem('rmo_token')
    setUser(null)
    setToken(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
