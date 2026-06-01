import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const HALAMAMA_LOGO_URL = 'https://halamama.com/cdn/shop/files/halamama_green.svg'

export function Login() {
  const { login } = useAuth()
  const { error: showError } = useToast()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted] = useState(false)

  const emailRef = useRef(null)

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true))
    emailRef.current?.focus()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    try {
      await login(email, password)
    } catch (err) {
      setErrorMsg(err.message || 'Login failed')
      showError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rmo-login-page">
      <div className={`rmo-login-wrapper ${mounted ? 'rmo-login-wrapper--visible' : ''}`}>
        <div className="rmo-login-card">

          <div className="rmo-login-body">
            {/* Logo */}
            <div className="rmo-login-brand">
              <div className="rmo-login-logo-box">
                <img src={HALAMAMA_LOGO_URL} alt="Halamama" className="rmo-login-logo-img" />
              </div>
              <h1 className="rmo-login-title">Welcome back</h1>
              <p className="rmo-login-subtitle">Sign in to RouteMyOrder Operations</p>
            </div>

            {/* Form */}
            <form className="rmo-login-form" onSubmit={handleSubmit}>
              {errorMsg && (
                <div className="rmo-login-error">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" x2="9" y1="9" y2="15"/><line x1="9" x2="15" y1="9" y2="15"/></svg>
                  {errorMsg}
                </div>
              )}

              {/* Email */}
              <div className="rmo-field">
                <label htmlFor="rmo-email" className="rmo-field-label">EMAIL</label>
                <div className="rmo-input-box">
                  <svg className="rmo-input-ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  <input
                    ref={emailRef}
                    id="rmo-email"
                    type="email"
                    className="rmo-input"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="picker@rmo.qa"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="rmo-field">
                <label htmlFor="rmo-password" className="rmo-field-label">PASSWORD</label>
                <div className="rmo-input-box">
                  <svg className="rmo-input-ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <input
                    id="rmo-password"
                    type={showPassword ? 'text' : 'password'}
                    className="rmo-input rmo-input--pw"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    className="rmo-pw-toggle"
                    onClick={() => setShowPassword(v => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" x2="23" y1="1" y2="23"/></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button type="submit" className="rmo-login-btn" disabled={loading}>
                {loading ? (
                  <span className="rmo-login-spinner" />
                ) : (
                  <>
                    Sign in
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </>
                )}
              </button>
            </form>

            {/* Demo credentials */}
            <div className="rmo-creds">
              <p className="rmo-creds-heading">DEMO CREDENTIALS</p>
              <div className="rmo-creds-list">
                <div className="rmo-cred-row">
                  <span className="rmo-cred-label">Picker</span>
                  <code className="rmo-cred-value">picker@rmo.qa</code>
                </div>
                <div className="rmo-cred-row">
                  <span className="rmo-cred-label">Packer</span>
                  <code className="rmo-cred-value">packer@rmo.qa</code>
                </div>
                <div className="rmo-cred-row">
                  <span className="rmo-cred-label">Driver</span>
                  <code className="rmo-cred-value">driver@rmo.qa</code>
                </div>
                <div className="rmo-cred-row rmo-cred-row--sep">
                  <span className="rmo-cred-label">Password</span>
                  <code className="rmo-cred-value">role + 123</code>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="rmo-login-copy">© 2026 Halamama LMD · RouteMyOrder</p>
      </div>
    </div>
  )
}
