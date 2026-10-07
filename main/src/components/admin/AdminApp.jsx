import { Navigate, NavLink, Route, Routes } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import { adminNavItems } from '../../data/menuData'
import { AdminDashboard } from './AdminDashboard'
import { MenuManager } from './MenuManager'

function AdminPanel({ title, cart = [], menuItems = [] }) {
  return (
    <div className="admin-pane">
      <header className="admin-page-heading compact-admin-heading"><div><p className="admin-kicker">Feasto management</p><h1>{title}</h1><p>Keep this part of your restaurant running smoothly.</p></div></header>
      <div className="admin-card empty-panel">
        <span className="admin-empty-icon"><i className="fa-solid fa-screwdriver-wrench" aria-hidden="true" /></span><h2>{title} workspace</h2><p>{title === 'Orders' ? `${cart.length + 3} live basket records are available from the current session.` : title === 'Categories' ? `${new Set(menuItems.map((item) => item.category)).size} active menu categories are currently in use.` : 'This connected workspace is ready for your next Feasto operation.'}</p>
        <NavLink className="primary-button button-link" to="/admin/dashboard">Back to dashboard</NavLink>
      </div>
    </div>
  )
}

export function AdminApp({ authUser, menuItems, setMenuItems, cart }) {
  const location = useLocation()

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <p className="admin-nav-label">Main</p>
        <nav className="admin-nav">
          {adminNavItems.slice(0, 8).map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? 'admin-link active' : 'admin-link')}>
              <span className="admin-link-icon" aria-hidden="true"><i className={`fa-solid ${['fa-chart-pie', 'fa-receipt', 'fa-utensils', 'fa-layer-group', 'fa-users', 'fa-star', 'fa-ticket', 'fa-chart-column'][adminNavItems.indexOf(item)]}`} /></span>{item.label}
            </NavLink>
          ))}
        </nav>
        <p className="admin-nav-label">Management</p>
        <nav className="admin-nav">
          {adminNavItems.slice(8).map((item) => <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? 'admin-link active' : 'admin-link')}><span className="admin-link-icon" aria-hidden="true"><i className={`fa-solid ${item.label === 'Users' ? 'fa-user-gear' : item.label === 'Staff' ? 'fa-user-group' : 'fa-gear'}`} /></span>{item.label}</NavLink>)}
        </nav>
        <div className="admin-upgrade"><strong>Upgrade to Pro</strong><p>Unlock advanced analytics, reports and more features.</p><NavLink to="/admin/reports">Upgrade Now</NavLink></div>
        <div className="admin-user"><span>{(authUser.user_metadata?.full_name || authUser.email || 'Admin').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</span><div><strong>{authUser.user_metadata?.full_name || authUser.email}</strong><small>Super Admin</small></div><b><i className="fa-solid fa-chevron-down" aria-hidden="true" /></b></div>
      </aside>

      <main className="admin-content" data-route={location.pathname}>
        <Routes>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard menuItems={menuItems} cart={cart} />} />
          <Route path="orders" element={<AdminPanel title="Orders" cart={cart} menuItems={menuItems} />} />
          <Route path="menu" element={<MenuManager menuItems={menuItems} setMenuItems={setMenuItems} />} />
          <Route path="categories" element={<AdminPanel title="Categories" menuItems={menuItems} />} />
          <Route path="customers" element={<AdminPanel title="Customers" cart={cart} menuItems={menuItems} />} />
          <Route path="reviews" element={<AdminPanel title="Reviews" />} />
          <Route path="coupons" element={<AdminPanel title="Coupons" />} />
          <Route path="reports" element={<AdminPanel title="Reports" menuItems={menuItems} />} />
          <Route path="users" element={<AdminPanel title="Users" />} />
          <Route path="staff" element={<AdminPanel title="Staff" />} />
          <Route path="settings" element={<AdminPanel title="Settings" />} />
        </Routes>
      </main>
    </div>
  )
}
