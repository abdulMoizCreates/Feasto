import { useMemo, useState } from 'react'
import { NavLink, useSearchParams } from 'react-router-dom'
import { Button } from '../ui/Button'
import { categories } from '../../data/menuData'
import { WishlistButton } from '../cards/WishlistButton'

const menuCategories = [...categories, 'Drinks', 'Desserts', 'Salads']
const ratingFilters = [
  { label: '4.5 & above', value: 4.5, count: 120 },
  { label: '4.0 & above', value: 4, count: 245 },
  { label: '3.5 & above', value: 3.5, count: 320 },
  { label: '3.0 & above', value: 3, count: 450 },
]

export function MenuPage({ addToCart, menuItems, likedItemIds, onToggleLike }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeCategory = searchParams.get('category') || 'all'
  const query = searchParams.get('search') || ''
  const [minimumRating, setMinimumRating] = useState(0)
  const [maximumPrice, setMaximumPrice] = useState(2000)
  const [sortBy, setSortBy] = useState('popular')

  const filteredItems = useMemo(() => {
    let items = [...menuItems]

    if (activeCategory !== 'all') {
      items = items.filter(
        (item) => item.category.toLowerCase() === activeCategory.toLowerCase(),
      )
    }

    if (query) {
      const searchTerm = query.toLowerCase()
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm) ||
          item.description.toLowerCase().includes(searchTerm),
      )
    }

    items = items.filter((item) => item.rating >= minimumRating && item.price * 100 <= maximumPrice)

    items.sort((a, b) => {
      if (sortBy === 'low-price') return a.price - b.price
      if (sortBy === 'high-price') return b.price - a.price
      if (sortBy === 'rating') return b.rating - a.rating
      return b.rating - a.rating
    })

    return items
  }, [activeCategory, maximumPrice, minimumRating, menuItems, query, sortBy])

  const updateFilter = (nextCategory) => {
    const next = new URLSearchParams(searchParams)
    if (nextCategory === 'all') {
      next.delete('category')
    } else {
      next.set('category', nextCategory)
    }
    setSearchParams(next)
  }

  const updateSearch = (event) => {
    const next = new URLSearchParams(searchParams)
    if (event.target.value) {
      next.set('search', event.target.value)
    } else {
      next.delete('search')
    }
    setSearchParams(next)
  }

  const clearFilters = () => {
    setSearchParams({})
    setMinimumRating(0)
    setMaximumPrice(2000)
  }

  return (
    <section className="container menu-page">
      <header className="menu-hero">
        <div className="menu-hero-copy">
          <p className="eyebrow">Menu</p>
          <h1>Delicious dishes,<br /><span>made for you.</span></h1>
          <p>Explore our full menu and find your next favorite meal from a wide range of tasty options.</p>
        </div>
        <div className="menu-hero-image">
          <img src="https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1000&q=80" alt="Bowl of pasta with fresh basil" />
        </div>
      </header>

      <div className="menu-workspace">
        <aside className="menu-filters" aria-label="Menu filters">
          <div className="filter-title"><h2>Filters</h2><span aria-hidden="true"><i className="fa-solid fa-sliders" /></span></div>
          <fieldset className="filter-group">
            <legend>Categories <span aria-hidden="true"><i className="fa-solid fa-chevron-up" /></span></legend>
            <label className="radio-filter"><input type="radio" name="category" checked={activeCategory === 'all'} onChange={() => updateFilter('all')} /><span>All Categories</span></label>
            {menuCategories.map((category) => (
              <label className="radio-filter" key={category}>
                <input type="radio" name="category" checked={activeCategory.toLowerCase() === category.toLowerCase()} onChange={() => updateFilter(category.toLowerCase())} />
                <span>{category}</span>
              </label>
            ))}
          </fieldset>

          <fieldset className="filter-group">
            <legend>Rating <span aria-hidden="true"><i className="fa-solid fa-chevron-up" /></span></legend>
            {ratingFilters.map((rating) => (
              <label className="radio-filter filter-rating" key={rating.value}>
                <input type="radio" name="rating" checked={minimumRating === rating.value} onChange={() => setMinimumRating(rating.value)} />
                <span><i className="fa-solid fa-star" aria-hidden="true" /> {rating.label}</span><small>({rating.count})</small>
              </label>
            ))}
          </fieldset>

          <fieldset className="filter-group price-filter">
            <legend>Price range <span aria-hidden="true"><i className="fa-solid fa-chevron-up" /></span></legend>
            <input type="range" min="100" max="2000" step="50" value={maximumPrice} onChange={(event) => setMaximumPrice(Number(event.target.value))} aria-label="Maximum price" />
            <div><span>Rs. 100</span><strong>Rs. {maximumPrice}+</strong></div>
          </fieldset>

          <Button variant="secondary" className="clear-filters" onClick={clearFilters}><i className="fa-solid fa-rotate-left" aria-hidden="true" /> &nbsp; Clear all filters</Button>
        </aside>

        <div className="menu-results">
          <div className="menu-toolbar">
            <label className="search-field">
              <span aria-hidden="true"><i className="fa-solid fa-magnifying-glass" /></span>
              <input type="search" value={query} onChange={updateSearch} placeholder="Search for burgers, pizza, drinks..." aria-label="Search menu" />
            </label>
            <label className="sort-field">Sort by:
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="sort-select" aria-label="Sort menu">
                <option value="popular">Most Popular</option>
                <option value="rating">Top rated</option>
                <option value="low-price">Price: low to high</option>
                <option value="high-price">Price: high to low</option>
              </select>
            </label>
          </div>
          <p className="results-count">Showing 1-{filteredItems.length} of {menuItems.length} items</p>

          <div className="product-grid menu-grid">
            {filteredItems.map((item) => (
              <article key={item.id} className="product-card menu-card">
                <div className="menu-card-media"><img src={item.image} alt={item.name} /><span className="menu-badge">{item.badge}</span><WishlistButton item={item} isLiked={likedItemIds.includes(item.id)} onToggle={onToggleLike} /></div>
                <div className="product-info">
                  <div className="meta-row"><span><i className="fa-solid fa-star" aria-hidden="true" /> {item.rating}</span><span className="rating-count">({Math.round(item.rating * 65)})</span></div>
                  <h3>{item.name}</h3><p>{item.description}</p>
                  <div className="card-footer"><strong>Rs. {Math.round(item.price * 100)}</strong><div className="action-row"><NavLink to={`/menu/${item.id}`} className="text-link small">View details</NavLink><Button variant="mini" onClick={() => addToCart(item)}>Add to cart</Button></div></div>
                </div>
              </article>
            ))}
          </div>

          {filteredItems.length === 0 ? <div className="empty-state">No dishes match those filters. Try clearing one and explore again.</div> : null}
          <nav className="pagination" aria-label="Menu pages"><button type="button" aria-label="Previous page"><i className="fa-solid fa-chevron-left" aria-hidden="true" /></button><button type="button" className="active">1</button><button type="button">2</button><button type="button">3</button><button type="button">4</button><span>...</span><button type="button">10</button><button type="button" aria-label="Next page"><i className="fa-solid fa-chevron-right" aria-hidden="true" /></button></nav>
        </div>
      </div>
    </section>
  )
}
