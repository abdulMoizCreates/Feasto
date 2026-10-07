import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { isSupabaseConfigured, supabase } from '../../lib/supabaseClient'

function getAuthErrorMessage(error) {
  if (error instanceof TypeError && /fetch/i.test(error.message)) {
    return 'Could not reach Supabase. Check that VITE_SUPABASE_URL is the URL of an active project, then restart the dev server.'
  }
  return error instanceof Error ? error.message : 'Unable to complete authentication. Please try again.'
}

export function AuthPage({ mode = 'login', onAuthenticated }) {
  const navigate = useNavigate()
  const isLogin = mode === 'login'
  const [form, setForm] = useState(() => ({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  }))
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return
      if (error) {
        setMessage(getAuthErrorMessage(error))
        return
      }
      if (active && data.session && isLogin) {
        const role = data.session.user.app_metadata?.role === 'admin' ? 'admin' : 'customer'
        onAuthenticated(data.session.user, role)
        navigate(role === 'admin' ? '/admin/dashboard' : '/profile', { replace: true })
      }
    }).catch((error) => {
      if (active) setMessage(getAuthErrorMessage(error))
    })
    return () => { active = false }
  }, [isLogin, navigate, onAuthenticated])

  const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))

  const submit = async (event) => {
    event.preventDefault()
    setMessage('')
    if (!isSupabaseConfigured) {
      setMessage('Supabase is not configured yet. Add your project URL and anon or publishable key to .env.local, then restart the dev server.')
      return
    }
    if (!isLogin && form.password !== form.confirmPassword) {
      setMessage('Passwords do not match.')
      return
    }
    setIsSubmitting(true)
    try {
      const result = isLogin
        ? await supabase.auth.signInWithPassword({ email: form.email, password: form.password })
        : await supabase.auth.signUp({ email: form.email, password: form.password, options: { data: { full_name: form.name, role: 'customer' } } })
      if (result.error) {
        setMessage(getAuthErrorMessage(result.error))
        return
      }
      const verifiedRole = result.data.user.app_metadata?.role === 'admin' ? 'admin' : 'customer'
      if (!isLogin && !result.data.session) {
        setMessage('Account created. Check your email to confirm your address, then sign in.')
        return
      }
      onAuthenticated(result.data.user, verifiedRole)
      navigate(verifiedRole === 'admin' ? '/admin/dashboard' : '/profile')
    } catch (error) {
      setMessage(getAuthErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="container auth-page auth-page-supabase">
      <div className="auth-visual"><span className="auth-mark"><i className="fa-solid fa-utensils" aria-hidden="true" /></span><p className="eyebrow">Welcome to Feasto</p><h1>Good food<br /><span>starts here.</span></h1><p>Save your favorites, follow every order, and make your next meal one click away.</p></div>
      <form className="auth-card auth-form" onSubmit={submit}>
        <p className="card-kicker">{isLogin ? 'Good to see you again' : 'Join the table'}</p>
        <h2>{isLogin ? 'Welcome back' : 'Create your Feasto account'}</h2>
        <p className="auth-helper">{isLogin ? 'Sign in to pick up where you left off.' : 'Your favorites and order history will be waiting for you.'}</p>
        {!isLogin ? <label>Full name<input name="name" value={form.name} onChange={updateField} type="text" placeholder="Abdul Moiz" required /></label> : null}
        <label>Email<input name="email" value={form.email} onChange={updateField} type="email" placeholder="you@example.com" required /></label>
        <label>Password<input name="password" value={form.password} onChange={updateField} type="password" placeholder="At least 6 characters" minLength="6" required /></label>
        {!isLogin ? <label>Confirm password<input name="confirmPassword" value={form.confirmPassword} onChange={updateField} type="password" placeholder="Repeat your password" minLength="6" required /></label> : null}
        {message ? <p className="auth-message" role="alert">{message}</p> : null}
        <button className="primary-button auth-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Connecting...' : isLogin ? 'Sign in' : 'Create account'} <i className="fa-solid fa-arrow-right" aria-hidden="true" /></button>
        <p className="auth-switch">{isLogin ? 'New to Feasto?' : 'Already have an account?'} <NavLink to={isLogin ? '/signup' : '/login'}>{isLogin ? 'Create account' : 'Sign in'}</NavLink></p>
      </form>
    </section>
  )
}
