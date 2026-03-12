import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchWishlist, removeFromWishlist } from '../../api/client';
import { useCart } from '../../context/CartContext';
import type { WishlistItem } from '../../types';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import './WishlistPage.css';

const FALLBACK_IMG = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect fill="#f5f5f5" width="120" height="120"/><text fill="#ccc" font-family="Arial" font-size="12" x="50%" y="50%" text-anchor="middle" dy="4">No Image</text></svg>'
);

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<number | null>(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<number | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchWishlist()
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const formatPrice = (p: number | null) =>
    p != null
      ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p)
      : '';

  const handleRemove = (productId: number) => {
    setRemoveTarget(productId);
    setShowRemoveModal(true);
  };

  const confirmRemove = async () => {
    if (!removeTarget) return;
    setShowRemoveModal(false);
    setRemoving(removeTarget);
    try {
      await removeFromWishlist(removeTarget);
      setItems((prev) => prev.filter((i) => i.product_id !== removeTarget));
    } catch (err) {
      console.error(err);
    } finally {
      setRemoving(null);
    }
  };

  const handleMoveToCart = async (item: WishlistItem) => {
    try {
      await addToCart(item.product_id); // This comes from CartContext, has requireAuth guard
      await removeFromWishlist(item.product_id);
      setItems((prev) => prev.filter((i) => i.product_id !== item.product_id));
      // refreshCart is already called inside CartContext's addToCart, but calling it again won't hurt, or we can just omit it
    } catch (err: any) {
      if (err?.response?.status !== 401) console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="wishlist-page container">
        <div className="home__loading">
          <div className="home__spinner" />
          <p>Loading wishlist…</p>
        </div>
      </div>
    );
  }

  return (
    <main className="wishlist-page container" id="wishlist-page">
      <ConfirmModal
        open={showRemoveModal}
        title="Remove from Wishlist?"
        message="Are you sure you want to remove this item from your wishlist?"
        confirmText="Remove"
        cancelText="Keep"
        variant="danger"
        onConfirm={confirmRemove}
        onCancel={() => setShowRemoveModal(false)}
      />

      <h1 className="wishlist-page__title">
        My Wishlist ({items.length})
      </h1>

      {items.length === 0 ? (
        <div className="wishlist-page__empty">
          <svg viewBox="0 0 24 24" width="72" height="72">
            <path fill="#ddd" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <h2>Your wishlist is empty</h2>
          <p>Save items you love to buy them later!</p>
          <Link to="/" className="wishlist-page__shop-btn">Start Shopping</Link>
        </div>
      ) : (
        <div className="wishlist-page__grid">
          {items.map((item) => (
            <div className="wishlist-card" key={item.id}>
              <button
                className="wishlist-card__remove"
                onClick={() => handleRemove(item.product_id)}
                disabled={removing === item.product_id}
                aria-label="Remove"
              >
                ✕
              </button>
              <Link to={`/product/${item.product_id}`} className="wishlist-card__img-wrap">
                <img
                  src={item.product_image || FALLBACK_IMG}
                  alt={item.product_name || 'Product'}
                  onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMG; }}
                />
              </Link>
              <div className="wishlist-card__info">
                <p className="wishlist-card__brand">{item.product_brand}</p>
                <Link to={`/product/${item.product_id}`} className="wishlist-card__name">
                  {item.product_name}
                </Link>
                <div className="wishlist-card__price-row">
                  <span className="wishlist-card__price">{formatPrice(item.product_price)}</span>
                  {item.product_original_price && item.product_original_price > (item.product_price ?? 0) && (
                    <>
                      <span className="wishlist-card__original">{formatPrice(item.product_original_price)}</span>
                      <span className="wishlist-card__discount">{item.product_discount_percent}% off</span>
                    </>
                  )}
                </div>
              </div>
              <button
                className="wishlist-card__cart-btn"
                onClick={() => handleMoveToCart(item)}
              >
                Move to Cart
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
