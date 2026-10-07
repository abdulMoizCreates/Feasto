import { BrowserRouter, Link, Navigate, NavLink, Route, Routes, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'

import './App.css'

import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { HomePage } from './components/pages/HomePage'
import { MenuPage } from './components/pages/MenuPage'
import { ProductPage } from './components/pages/ProductPage'
import { WishlistPage } from './components/pages/WishlistPage'
import { AboutPage, ContactPage, OffersPage } from './components/pages/SecondaryPages'
import { AdminApp } from './components/admin/AdminApp'
import { ScrollMotion } from './components/motion/ScrollMotion'
import { AuthPage } from './components/pages/AuthPage'
import { menuItems as initialMenuItems } from './data/menuData'
import { supabase } from './lib/supabaseClient'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    const previousRestoration = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'

    return () => {
      window.history.scrollRestoration = previousRestoration
    }
  }, [])

  useLayoutEffect(() => {
    const resetScroll = () => {
      if (document.scrollingElement) document.scrollingElement.scrollTop = 0
      document.body.scrollTop = 0
      document.querySelector('.admin-content')?.scrollTo(0, 0)
    }

    resetScroll()
    const frame = window.requestAnimationFrame(resetScroll)
    return () => window.cancelAnimationFrame(frame)
  }, [pathname])

  return null
}

function App() {
  const [authUser, setAuthUser] = useState(null)
  const [authRole, setAuthRole] = useState('customer')
  const [menuItems, setMenuItems] = useState(initialMenuItems)
  const [likedItemIds, setLikedItemIds] = useState([])
  const [cart, setCart] = useState([])
  const [accountDataUserId, setAccountDataUserId] = useState(null)
  const [isAccountDataLoading, setIsAccountDataLoading] = useState(false)
  const [accountDataError, setAccountDataError] = useState('')

  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(({ data }) => {
      if (!active || !data.session?.user) return
      setAuthUser(data.session.user)
      setAuthRole(data.session.user.app_metadata?.role === 'admin' ? 'admin' : 'customer')
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setAuthUser(null)
        setAuthRole('customer')
        return
      }
      setAuthUser(session.user)
      setAuthRole(session.user.app_metadata?.role === 'admin' ? 'admin' : 'customer')
    })

    return () => {
      active = false
      authListener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    const userId = authUser?.id
    let active = true

    Promise.resolve().then(() => {
      if (!active) return
      setAccountDataUserId(null)
      setCart([])
      setLikedItemIds([])
      setAccountDataError('')
      setIsAccountDataLoading(Boolean(userId))
    })

    if (!userId) return () => { active = false }
    Promise.all([
      supabase.from('customer_cart_items')
        .select('menu_item_id, name, unit_price, quantity')
        .eq('user_id', userId),
      supabase.from('customer_wishlist_items')
        .select('menu_item_id')
        .eq('user_id', userId),
    ]).then(([cartResult, wishlistResult]) => {
      if (!active) return
      if (cartResult.error) throw cartResult.error
      if (wishlistResult.error) throw wishlistResult.error

      setCart((cartResult.data || []).map((item) => ({
        id: Number(item.menu_item_id),
        name: item.name,
        price: Number(item.unit_price),
        quantity: item.quantity,
      })))
      setLikedItemIds((wishlistResult.data || []).map((item) => Number(item.menu_item_id)))
      setAccountDataUserId(userId)
    }).catch((error) => {
      if (active) {
        setAccountDataError(`Could not load your saved cart and wishlist: ${error.message}`)
      }
    }).finally(() => {
      if (active) setIsAccountDataLoading(false)
    })

    return () => { active = false }
  }, [authUser?.id])

  const handleAuthenticated = useCallback((user, role = 'customer') => {
    setAuthUser(user)
    setAuthRole(role)
  }, [])

  const visibleCart = accountDataUserId === authUser?.id ? cart : []
  const visibleLikedItemIds = accountDataUserId === authUser?.id ? likedItemIds : []

  const canUpdateAccountData = () => {
    if (!authUser) return true
    if (accountDataUserId === authUser.id) return true
    setAccountDataError('Your saved account data is still loading. Please try again in a moment.')
    return false
  }

  const saveAccountData = async (request, failureMessage) => {
    try {
      const { error } = await request
      if (error) throw error
      return true
    } catch (error) {
      setAccountDataError(`${failureMessage}: ${error instanceof Error ? error.message : 'Network request failed.'}`)
      return false
    }
  }

  const addToCart = async (item) => {
    if (!canUpdateAccountData()) return
    const existing = visibleCart.find((entry) => entry.id === item.id)
    const nextItem = existing
      ? { ...existing, quantity: existing.quantity + 1 }
      : { id: item.id, name: item.name, quantity: 1, price: item.price }

    if (authUser) {
      const saved = await saveAccountData(supabase.from('customer_cart_items').upsert({
        user_id: authUser.id,
        menu_item_id: nextItem.id,
        name: nextItem.name,
        unit_price: nextItem.price,
        quantity: nextItem.quantity,
      }, { onConflict: 'user_id,menu_item_id' }), 'Could not save this item to your cart')
      if (!saved) return
    }

    setAccountDataError('')
    setCart(existing
      ? visibleCart.map((entry) => entry.id === item.id ? nextItem : entry)
      : [...visibleCart, nextItem])
  }

  const updateQuantity = async (id, delta) => {
    if (!canUpdateAccountData()) return
    const currentItem = visibleCart.find((entry) => entry.id === id)
    if (!currentItem) return
    const quantity = Math.max(0, currentItem.quantity + delta)

    if (authUser) {
      const request = quantity === 0
        ? supabase.from('customer_cart_items').delete()
          .eq('user_id', authUser.id).eq('menu_item_id', id)
        : supabase.from('customer_cart_items').update({ quantity })
          .eq('user_id', authUser.id).eq('menu_item_id', id)
      if (!await saveAccountData(request, 'Could not update your cart')) return
    }

    setAccountDataError('')
    setCart(quantity === 0
      ? visibleCart.filter((entry) => entry.id !== id)
      : visibleCart.map((entry) => entry.id === id ? { ...entry, quantity } : entry))
  }

  const removeItem = async (id) => {
    if (!canUpdateAccountData()) return
    if (authUser) {
      const request = supabase.from('customer_cart_items').delete()
        .eq('user_id', authUser.id).eq('menu_item_id', id)
      if (!await saveAccountData(request, 'Could not remove this item from your cart')) return
    }

    setAccountDataError('')
    setCart(visibleCart.filter((entry) => entry.id !== id))
  }

  const toggleLikedItem = async (id) => {
    if (!canUpdateAccountData()) return
    const isLiked = visibleLikedItemIds.includes(id)

    if (authUser) {
      const request = isLiked
        ? supabase.from('customer_wishlist_items').delete()
          .eq('user_id', authUser.id).eq('menu_item_id', id)
        : supabase.from('customer_wishlist_items').insert({
          user_id: authUser.id,
          menu_item_id: id,
        })
      if (!await saveAccountData(request, 'Could not update your wishlist')) return
    }

    setAccountDataError('')
    setLikedItemIds(isLiked
      ? visibleLikedItemIds.filter((itemId) => itemId !== id)
      : [...visibleLikedItemIds, id])
  }

  const placeOrder = async ({ deliveryAddress, paymentMethod }) => {
    if (!authUser) throw new Error('Sign in before placing an order.')
    if (!canUpdateAccountData()) throw new Error('Your saved cart is still loading. Please try again in a moment.')
    if (cart.length === 0) throw new Error('Your cart is empty.')

    const { data, error } = await supabase.rpc('place_customer_order', {
      p_delivery_address: deliveryAddress,
      p_payment_method: paymentMethod,
    })
    if (error) throw error

    setCart([])
    return data
  }

  return (
    <BrowserRouter>
      <FeastoApp
        cart={visibleCart}
        cartCount={visibleCart.reduce((sum, item) => sum + item.quantity, 0)}
        likedCount={visibleLikedItemIds.length}
        accountDataError={accountDataError}
        isAccountDataLoading={isAccountDataLoading}
        onPlaceOrder={placeOrder}
        addToCart={addToCart}
        updateQuantity={updateQuantity}
        removeItem={removeItem}
        menuItems={menuItems}
        setMenuItems={setMenuItems}
        likedItemIds={visibleLikedItemIds}
        onToggleLike={toggleLikedItem}
        authUser={authUser}
        authRole={authRole}
        onAuthenticated={handleAuthenticated}
        onProfileUpdated={setAuthUser}
        onSignedOut={() => { setAuthUser(null); setAuthRole('customer') }}
      />
    </BrowserRouter>
  )
}

function FeastoApp({ cart, cartCount, likedCount, accountDataError, isAccountDataLoading, onPlaceOrder, addToCart, updateQuantity, removeItem, menuItems, setMenuItems, likedItemIds, onToggleLike, authUser, authRole, onAuthenticated, onProfileUpdated, onSignedOut }) {
  const location = useLocation()

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity * item.price, 0),
    [cart],
  )

  return (
    <div className="feasto-app">
      <Header cartCount={cartCount} likedCount={likedCount} authUser={authUser} authRole={authRole} onSignedOut={onSignedOut} />
      <ScrollToTop />

      <main className={`page-shell${location.pathname.startsWith('/admin') ? ' admin-page-shell' : ''}`}>
        {accountDataError ? <p className="account-data-error" role="alert">{accountDataError} If needed, run the Supabase migration in <code>main/supabase/migrations</code>.</p> : null}
        <Routes>
          <Route index element={<HomePage addToCart={addToCart} likedItemIds={likedItemIds} onToggleLike={onToggleLike} />} />
          <Route path="/menu" element={<MenuPage addToCart={addToCart} menuItems={menuItems} likedItemIds={likedItemIds} onToggleLike={onToggleLike} />} />
          <Route path="/menu/:productId" element={<ProductPage addToCart={addToCart} menuItems={menuItems} />} />
          <Route path="/wishlist" element={<WishlistPage menuItems={menuItems} likedItemIds={likedItemIds} addToCart={addToCart} onToggleLike={onToggleLike} />} />
          <Route path="/offers" element={<OffersPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/cart" element={<CartPage cart={cart} updateQuantity={updateQuantity} removeItem={removeItem} subtotal={subtotal} />} />
          <Route path="/checkout" element={<CheckoutPage subtotal={subtotal} authUser={authUser} isAccountDataLoading={isAccountDataLoading} onPlaceOrder={onPlaceOrder} />} />
          <Route path="/order-success" element={<OrderSuccessPage />} />
          <Route path="/login" element={<AuthPage mode="login" onAuthenticated={onAuthenticated} />} />
          <Route path="/signup" element={<AuthPage mode="signup" onAuthenticated={onAuthenticated} />} />
          <Route path="/profile" element={authUser ? <ProfilePage authUser={authUser} onProfileUpdated={onProfileUpdated} /> : <Navigate to="/login" replace />} />
          <Route path="/orders" element={authUser ? <OrdersPage authUser={authUser} /> : <Navigate to="/login" replace />} />
          <Route path="/admin/*" element={authUser && authRole === 'admin' ? <AdminApp authUser={authUser} menuItems={menuItems} setMenuItems={setMenuItems} cart={cart} /> : <Navigate to={authUser ? '/profile' : '/login'} replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <ScrollMotion />

      {location.pathname.startsWith('/admin') ? null : <Footer />}
    </div>
  )
}

function CartPage({ cart, updateQuantity, removeItem, subtotal }) {
  return (
    <section className="container cart-page">
      <div className="section-heading">
        <h2>Your cart</h2>
      </div>

      <div className="cart-layout">
        <div className="cart-list">
          {cart.length === 0 ? (
            <div className="empty-state">Your cart is empty.</div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="cart-item">
                <div>
                  <h3>{item.name}</h3>
                  <p>${item.price.toFixed(2)} each</p>
                </div>

                <div className="cart-controls">
                  <button type="button" aria-label={`Decrease ${item.name} quantity`} onClick={() => updateQuantity(item.id, -1)}><i className="fa-solid fa-minus" aria-hidden="true" /></button>
                  <span>{item.quantity}</span>
                  <button type="button" aria-label={`Increase ${item.name} quantity`} onClick={() => updateQuantity(item.id, 1)}><i className="fa-solid fa-plus" aria-hidden="true" /></button>
                </div>

                <strong>${(item.price * item.quantity).toFixed(2)}</strong>

                <button type="button" className="remove-button" onClick={() => removeItem(item.id)}>
                  <i className="fa-solid fa-trash-can" aria-hidden="true" /> Remove
                </button>
              </div>
            ))
          )}
        </div>

        <aside className="checkout-panel">
          <h3>Order summary</h3>

          <div className="summary-row">
            <span>Subtotal</span>
            <strong>${subtotal.toFixed(2)}</strong>
          </div>

          <div className="summary-row">
            <span>Delivery</span>
            <strong>$4.99</strong>
          </div>

          <div className="summary-row total">
            <span>Total</span>
            <strong>${(subtotal + 4.99).toFixed(2)}</strong>
          </div>

          <NavLink to="/checkout" className="primary-button button-link">
            Proceed to checkout
          </NavLink>
        </aside>
      </div>
    </section>
  )
}

function CheckoutPage({ subtotal, authUser, isAccountDataLoading, onPlaceOrder }) {
  const navigate = useNavigate()
  const [deliveryAddress, setDeliveryAddress] = useState(authUser?.user_metadata?.address || '')
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const deliveryFee = 4.99

  const submitOrder = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      const orderId = await onPlaceOrder({ deliveryAddress, paymentMethod })
      navigate(`/order-success?order=${encodeURIComponent(orderId)}`)
    } catch (submitError) {
      setError(submitError.message || 'Could not place your order.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="container simple-page checkout-page">
      <h2>Checkout</h2>
      {!authUser ? <p className="profile-message" role="status">Sign in to place an order and keep it in your personal order history. <Link to="/login">Sign in</Link></p> : null}
      <form className="checkout-grid" onSubmit={submitOrder}>
        <div className="info-card">
          <h3>Delivery details</h3>
          <label>
            Address
            <textarea value={deliveryAddress} onChange={(event) => setDeliveryAddress(event.target.value)} rows="3" required />
          </label>
          <label>
            Payment
            <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
              <option value="card">Card (not charged)</option>
              <option value="cash">Cash on delivery</option>
            </select>
          </label>
          <p>No payment is processed, and no card details are collected or stored.</p>
        </div>
        <aside className="checkout-panel">
          <h3>Payment summary</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <strong>${subtotal.toFixed(2)}</strong>
          </div>
          <div className="summary-row">
            <span>Delivery</span>
            <strong>${deliveryFee.toFixed(2)}</strong>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <strong>${(subtotal + deliveryFee).toFixed(2)}</strong>
          </div>
          {error ? <p className="account-data-error" role="alert">{error}</p> : null}
          <button className="primary-button" type="submit" disabled={!authUser || isAccountDataLoading || isSubmitting || subtotal <= 0}>
            {isSubmitting ? 'Placing order...' : 'Place order'}
          </button>
        </aside>
      </form>
    </section>
  )
}

function OrderSuccessPage() {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('order')

  return (
    <section className="container simple-page success-page">
      <div className="success-panel">
        <h2>Order confirmed</h2>
        <p>Your order has been saved to your account. No payment was processed.</p>
        {orderId ? <p>Order reference: <strong>{orderId}</strong></p> : null}
        <NavLink to="/orders" className="primary-button button-link">
          View order history
        </NavLink>
      </div>
    </section>
  )
}

function ProfilePage({ authUser, onProfileUpdated }) {
  const metadata = authUser.user_metadata || {}
  const [form, setForm] = useState({
    full_name: metadata.full_name || '',
    avatar_url: metadata.avatar_url || '',
    phone: metadata.phone || '',
    address: metadata.address || '',
  })
  const [message, setMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))

  const saveProfile = async (event) => {
    event.preventDefault()
    setIsSaving(true)
    setMessage('')
    const { data, error } = await supabase.auth.updateUser({ data: form })
    setIsSaving(false)
    if (error) {
      setMessage(error.message)
      return
    }
    onProfileUpdated(data.user)
    setMessage('Profile updated.')
  }

  const displayName = form.full_name || authUser.email?.split('@')[0] || 'Feasto customer'
  const initials = displayName.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()

  return (
    <section className="container simple-page profile-page">
      <div className="profile-heading"><div><p className="eyebrow">Your Feasto account</p><h2>My profile</h2><p>Keep your details ready for the next order.</p></div><div className="profile-avatar">{form.avatar_url ? <img src={form.avatar_url} alt="" /> : initials}</div></div>

      <div className="info-grid">
        <form className="info-card profile-form" onSubmit={saveProfile}>
          <h3>Personal information</h3>
          <label>Full name<input name="full_name" value={form.full_name} onChange={updateField} placeholder="Your full name" required /></label>
          <label>Email<input value={authUser.email || ''} readOnly /></label>
          <label>Avatar URL<input name="avatar_url" value={form.avatar_url} onChange={updateField} type="url" placeholder="https://..." /></label>
          <label>Phone<input name="phone" value={form.phone} onChange={updateField} type="tel" placeholder="+92 300 0000000" /></label>
          <label>Delivery address<textarea name="address" value={form.address} onChange={updateField} rows="3" placeholder="Your preferred delivery address" /></label>
          {message ? <p className="profile-message" role="status">{message}</p> : null}
          <button className="primary-button" type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save changes'} <i className="fa-solid fa-check" aria-hidden="true" /></button>
        </form>

        <div className="info-card profile-summary"><h3>Account</h3><div className="profile-summary-avatar">{form.avatar_url ? <img src={form.avatar_url} alt="" /> : initials}</div><strong>{displayName}</strong><p>{authUser.email}</p><span className="role-badge">Customer</span><p className="profile-note">Your profile details are saved securely with your Supabase account.</p></div>
      </div>
    </section>
  )
}

function OrdersPage({ authUser }) {
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true

    supabase.from('customer_orders')
      .select('id, created_at, status, items, total, payment_method')
      .eq('user_id', authUser.id)
      .order('created_at', { ascending: false })
      .then(({ data, error: queryError }) => {
        if (!active) return
        if (queryError) {
          setError(`Could not load your order history: ${queryError.message}`)
          return
        }
        setOrders(data || [])
      }).catch((queryError) => {
        if (active) setError(`Could not load your order history: ${queryError.message}`)
      }).finally(() => {
        if (active) setIsLoading(false)
      })

    return () => { active = false }
  }, [authUser.id])

  return (
    <section className="container simple-page">
      <h2>Order history</h2>
      {error ? <p className="account-data-error" role="alert">{error} If needed, run the Supabase migration in <code>main/supabase/migrations</code>.</p> : null}
      {isLoading ? <p role="status">Loading your orders...</p> : null}
      {!isLoading && !error && orders.length === 0 ? <div className="empty-state">You have no orders yet.</div> : null}
      {orders.length > 0 ? <div className="info-list">{orders.map((order) => (
        <article className="info-card order-row" key={order.id}>
          <div>
            <strong>Order {order.id.slice(0, 8)}</strong>
            <p>{(order.items || []).map((item) => `${item.name} x${item.quantity}`).join(', ')}</p>
            <small>{new Date(order.created_at).toLocaleString()} · {order.payment_method === 'card' ? 'Card selected (not charged)' : 'Cash on delivery'}</small>
          </div>
          <span>{order.status} · ${Number(order.total).toFixed(2)}</span>
        </article>
      ))}</div> : null}
    </section>
  )
}

export default App
