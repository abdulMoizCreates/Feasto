import { useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'

export function Header({ cartCount, likedCount, authUser, authRole, onSignedOut }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [openMenuPath, setOpenMenuPath] = useState(null)
  const isMenuOpen = openMenuPath === location.pathname
  const displayName = authUser?.user_metadata?.full_name || authUser?.email?.split('@')[0] || ''
  const initials = displayName.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()

  useEffect(() => {
    if (!isMenuOpen) return undefined

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setOpenMenuPath(null)
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [isMenuOpen])

  const signOut = async () => {
    await supabase.auth.signOut()
    onSignedOut()
    navigate('/')
  }
  const navItems = [
    { to: '/', label: 'Home' },
    { to: '/menu', label: 'Menu' },
    { to: '/offers', label: 'Offers' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ]

  return (
    <header className="topbar">
      <div className="container nav-wrap">
        <NavLink to="/" className="brand" end>
          <span className="brand-mark">F</span>
          <span>Feasto</span>
        </NavLink>

        <button
          type="button"
          className="mobile-nav-toggle"
          aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isMenuOpen}
          aria-controls="primary-navigation"
          onClick={() => setOpenMenuPath(isMenuOpen ? null : location.pathname)}
        >
          <i className={`fa-solid ${isMenuOpen ? 'fa-xmark' : 'fa-bars'}`} aria-hidden="true" />
        </button>

        <nav id="primary-navigation" className={`main-nav${isMenuOpen ? ' is-open' : ''}`} aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              onClick={() => setOpenMenuPath(null)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-actions">
          <NavLink to="/wishlist" className={({ isActive }) => `wishlist-nav-link${isActive ? ' active' : ''}`} aria-label={`Wishlist, ${likedCount} saved items`}>
            <i className="fa-regular fa-heart" aria-hidden="true" />
            {likedCount > 0 ? <span>{likedCount}</span> : null}
          </NavLink>
          {authUser ? <div className="account-nav"><NavLink to="/profile" className="account-link" aria-label="Open profile"><span className="header-avatar">{authUser.user_metadata?.avatar_url ? <img src={authUser.user_metadata.avatar_url} alt="" /> : initials}</span><span>{displayName}</span></NavLink><button type="button" className="signout-button" onClick={signOut}>Sign out</button></div> : <div className="auth-nav-links" aria-label="Account navigation"><NavLink to="/login" className={({ isActive }) => (isActive ? 'auth-nav-link active' : 'auth-nav-link')}><i className="fa-regular fa-user" aria-hidden="true" /><span>Login</span></NavLink><NavLink to="/signup" className={({ isActive }) => (isActive ? 'auth-nav-link signup-link active' : 'auth-nav-link signup-link')}><span>Sign up</span><i className="fa-solid fa-arrow-right" aria-hidden="true" /></NavLink></div>}
          <NavLink to="/cart" className="cart-link">
            <span>Cart</span>
            <strong>{cartCount}</strong>
          </NavLink>
          {authUser && authRole === 'admin' ? <NavLink to="/admin/dashboard" className="dashboard-link">Dashboard</NavLink> : null}
        </div>
      </div>
    </header>
  )
}
