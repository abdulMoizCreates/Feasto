import { NavLink } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand-block">
          <div className="brand footer-brand">
            <span className="brand-mark">F</span>
            <span>feasto.</span>
          </div>
          <p>Good food, real ingredients. Great times.</p>
        </div>

        <div className="footer-links-group">
          <h4>Quick links</h4>
          <NavLink to="/">Home</NavLink>
          <NavLink to="/menu">Menu</NavLink>
          <NavLink to="/offers">Offers</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/contact">Contact</NavLink>
          <NavLink to="/login">Admin login</NavLink>
        </div>

        <div className="footer-links-group">
          <h4>Help</h4>
          <NavLink to="/login">FAQs</NavLink>
          <NavLink to="/orders">Shipping &amp; Delivery</NavLink>
          <NavLink to="/orders">Returns</NavLink>
          <NavLink to="/profile">Terms &amp; Conditions</NavLink>
          <NavLink to="/profile">Privacy Policy</NavLink>
        </div>

        <div className="footer-links-group">
          <h4>Contact</h4>
          <a href="tel:+923002134567">+92 300 2134567</a>
          <a href="mailto:hello@feasto.com">hello@feasto.com</a>
          <span>Karachi, Pakistan</span>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2024 Feasto. All rights reserved.</span>
        <span>Made with ❤️ for good food lovers.</span>
      </div>
    </footer>
  )
}
