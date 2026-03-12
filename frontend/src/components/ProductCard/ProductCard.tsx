import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import type { ProductBrief } from '../../types';
import './ProductCard.css';

interface Props {
  product: ProductBrief;
}

const FALLBACK_IMG = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="280" height="280" viewBox="0 0 280 280"><rect fill="#f5f5f5" width="280" height="280"/><text fill="#ccc" font-family="Arial" font-size="14" x="50%" y="50%" text-anchor="middle" dy="5">No Image</text></svg>'
);

export default function ProductCard({ product }: Props) {
  const {
    id,
    name,
    price,
    original_price,
    discount_percent,
    brand,
    rating,
    rating_count,
    image_url,
  } = product;

  const { requireAuth } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const wishlisted = isWishlisted(id);

  const formatPrice = (p: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

  const formatCount = (c: number) => {
    if (c >= 100000) return `${(c / 100000).toFixed(1)}L`;
    if (c >= 1000) return `${(c / 1000).toFixed(1)}K`;
    return String(c);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!requireAuth()) return;
    toggleWishlist(id);
  };

  return (
    <Link to={`/product/${id}`} className="product-card" id={`product-card-${id}`}>
      {/* Image */}
      <div className="product-card__img-wrap">
        <img
          src={image_url || FALLBACK_IMG}
          alt={name}
          className="product-card__img"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = FALLBACK_IMG;
          }}
        />
        {discount_percent > 0 && (
          <span className="product-card__discount-tag">
            {discount_percent}% off
          </span>
        )}
        <button
          className={`product-card__wishlist-btn ${wishlisted ? 'product-card__wishlist-btn--active' : ''}`}
          onClick={handleWishlistClick}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <svg viewBox="0 0 24 24" width="20" height="20">
            {wishlisted ? (
              <path
                fill="#ff4081"
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              />
            ) : (
              <path
                fill="none"
                stroke="#888"
                strokeWidth="1.8"
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Info */}
      <div className="product-card__info">
        {brand && <p className="product-card__brand">{brand}</p>}
        <h3 className="product-card__name">{name}</h3>

        {/* Rating */}
        <div className="product-card__rating">
          <span className="product-card__rating-badge">
            {rating.toFixed(1)} ★
          </span>
          <span className="product-card__rating-count">
            ({formatCount(rating_count)})
          </span>
        </div>

        {/* Price */}
        <div className="product-card__price-row">
          <span className="product-card__price">{formatPrice(price)}</span>
          {original_price && original_price > price && (
            <>
              <span className="product-card__original-price">
                {formatPrice(original_price)}
              </span>
              <span className="product-card__discount">
                {discount_percent}% off
              </span>
            </>
          )}
        </div>

        <p className="product-card__delivery">Free delivery</p>
      </div>
    </Link>
  );
}
