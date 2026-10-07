export function WishlistButton({ item, isLiked, onToggle }) {
  return (
    <button
      type="button"
      className={`wishlist-button${isLiked ? ' is-liked' : ''}`}
      aria-label={isLiked ? `Remove ${item.name} from favorites` : `Add ${item.name} to favorites`}
      aria-pressed={isLiked}
      onClick={() => onToggle(item.id)}
    >
      <i className={`${isLiked ? 'fa-solid' : 'fa-regular'} fa-heart`} aria-hidden="true" />
    </button>
  )
}
