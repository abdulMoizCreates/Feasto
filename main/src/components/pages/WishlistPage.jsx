import { NavLink } from 'react-router-dom'
import { ProductCard } from '../cards/ProductCard'

export function WishlistPage({ menuItems, likedItemIds, addToCart, onToggleLike }) {
  const likedItems = menuItems.filter((item) => likedItemIds.includes(item.id))

  return (
    <section className="container secondary-page wishlist-page">
      <header className="page-intro">
        <p className="eyebrow">Saved for later</p>
        <h1>Your wishlist<span>.</span></h1>
        <p className="intro-copy">All the good stuff you have your eye on, in one place.</p>
      </header>

      {likedItems.length > 0 ? (
        <div className="product-grid">
          {likedItems.map((item) => (
            <ProductCard
              key={item.id}
              item={item}
              onAddToCart={addToCart}
              isLiked
              onToggleLike={onToggleLike}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state wishlist-empty">
          <i className="fa-regular fa-heart" aria-hidden="true" />
          <h2>Your wishlist is empty</h2>
          <p>Tap the heart on a dish to save it here.</p>
          <NavLink to="/menu" className="primary-button button-link">Explore the menu</NavLink>
        </div>
      )}
    </section>
  )
}
