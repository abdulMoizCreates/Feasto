import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button'
import { CategoryCard } from '../cards/CategoryCard'
import { ProductCard } from '../cards/ProductCard'
import { categories, menuItems } from '../../data/menuData'

export function HomePage({ addToCart, likedItemIds, onToggleLike }) {
  const navigate = useNavigate()

  return (
    <>
      <section className="hero-section container">
        <div className="hero-copy">
          <p className="eyebrow">Fast food, considered</p>
          <h1>
            The good stuff,
            <span>made with intent.</span>
          </h1>
          <p className="lead">
            Burgers, chicken, pizza, and fries built for busy nights, quick lunches, and cravings that deserve a better bite.
          </p>
          <div className="hero-actions">
            <Button variant="primary" onClick={() => navigate('/menu')}>
              Explore the menu
            </Button>
            <Button variant="secondary" onClick={() => navigate('/offers')}>
              See today&apos;s offer
            </Button>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-card feature-card">
            <img
              src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80"
              alt="Stacked gourmet burger"
            />
          </div>
          <div className="floating-badge">
            <span>4.9</span>
            <small>Top rated</small>
          </div>
        </div>
      </section>

      <section className="container category-section">
        <div className="category-shell">
          <div className="section-header-row">
            <span className="muted-text">Start somewhere good</span>
            <h2>What are you in the mood for?</h2>
            <p>From a quick bite to a table full of favorites, find your next favorite in a few clicks.</p>
          </div>
          <div className="category-grid">
            {categories.map((category) => (
              <CategoryCard
                key={category}
                label={category}
                onClick={() => navigate(`/menu?category=${category.toLowerCase()}`)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="container popular-section">
        <div className="section-heading split-heading">
          <div>
            <span className="muted-text">The shortlist</span>
            <h2>Most wanted</h2>
          </div>
          <button type="button" className="text-link" onClick={() => navigate('/menu')}>
            View full menu
          </button>
        </div>

        <div className="product-grid home-product-grid">
          {menuItems.slice(0, 3).map((item) => (
            <ProductCard key={item.id} item={item} onAddToCart={addToCart} isLiked={likedItemIds.includes(item.id)} onToggleLike={onToggleLike} />
          ))}
        </div>
      </section>

      <section className="container panel-section">
        <div className="chef-rotation">
          <div className="chef-copy">
            <span className="muted-text">From the place</span>
            <h2>Chef&apos;s rotation</h2>
            <p>
              A moving selection of season favorites, picked for wherever and however you are today.
            </p>
            <div className="chef-meta">
              <span><i className="fa-solid fa-circle" aria-hidden="true" /></span>
              <span>02</span>
              <span>/</span>
              <span>05</span>
            </div>
            <div className="chef-title-block">
              <h3>Pepperoni Farm</h3>
              <p>Chip-graded dough, rich tomato sauce, mozzarella, and pepperoni.</p>
            </div>
            <Button variant="secondary" className="compact-button" onClick={() => navigate('/menu')}>
              Explore this
            </Button>
          </div>
          <div className="chef-visual">
            <img
              src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80"
              alt="Chef special pizza"
            />
          </div>
        </div>
      </section>

      <section className="container steps-section">
        <div className="section-header-row">
          <span className="muted-text">No complicated moves</span>
          <h2>Good food, three steps away.</h2>
          <p>Everything from first click to first bite is designed to feel quick, clear, and worth repeating.</p>
        </div>

        <div className="steps-grid">
          <div className="step-card">
            <span className="step-number">01</span>
            <div className="step-icon"><i className="fa-solid fa-location-dot" aria-hidden="true" /></div>
            <h3>Choose your craving</h3>
            <p>Browse the menu and find the dish that fits the moment.</p>
          </div>
          <div className="step-card">
            <span className="step-number">02</span>
            <div className="step-icon"><i className="fa-solid fa-bag-shopping" aria-hidden="true" /></div>
            <h3>Make it yours</h3>
            <p>Add favorites to your cart and adjust the quantity in seconds.</p>
          </div>
          <div className="step-card">
            <span className="step-number">03</span>
            <div className="step-icon"><i className="fa-solid fa-utensils" aria-hidden="true" /></div>
            <h3>Meet your meal</h3>
            <p>Place your order and enjoy the bite you have been craving.</p>
          </div>
        </div>
      </section>

      <section className="container promo-banner">
        <div className="promo-copy">
          <span className="muted-text">A little extra</span>
          <h2>Two meals. One very good deal.</h2>
          <p>Get any two items and save 15%. It&apos;s made for hungry days and friends you trust.</p>
          <Button variant="primary" onClick={() => navigate('/offers')}>
            Grab this deal
          </Button>
        </div>
        <div className="promo-visual">
          <img
            src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=80"
            alt="Burger and fries combo"
          />
        </div>
      </section>
    </>
  )
}
