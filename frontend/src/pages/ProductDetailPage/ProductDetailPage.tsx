import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProduct } from '../../api/client';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import type { ProductDetail as ProductDetailType } from '../../types';
import ImageCarousel from '../../components/ImageCarousel/ImageCarousel';
import './ProductDetailPage.css';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { requireAuth } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [product, setProduct] = useState<ProductDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchProduct(Number(id))
      .then(setProduct)
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  const formatPrice = (p: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(p);

  const handleAddToCart = async () => {
    if (!product) return;
    setAddingToCart(true);
    try {
      await addToCart(product.id);
    } catch (err: any) {
      // 401 means auth modal opened — don't show error
      if (err?.response?.status !== 401) console.error(err);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    setAddingToCart(true);
    try {
      await addToCart(product.id);
      // Only navigate if user is authenticated (addToCart won't throw 401 if auth modal opened)
      navigate('/cart');
    } catch (err: any) {
      if (err?.response?.status !== 401) console.error(err);
    } finally {
      setAddingToCart(false);
    }
  };

  // Parse specifications JSON
  const specs: Record<string, string> = (() => {
    if (!product?.specifications) return {};
    try {
      return JSON.parse(product.specifications);
    } catch {
      return {};
    }
  })();

  if (loading) {
    return (
      <div className="pdp__loading container">
        <div className="home__spinner" />
        <p>Loading product…</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pdp__not-found container">
        <h2>Product not found</h2>
        <button onClick={() => navigate('/')}>Go back to home</button>
      </div>
    );
  }

  return (
    <main className="pdp container" id="product-detail-page">
      <div className="pdp__layout">
        {/* Left — Images + Actions */}
        <div className="pdp__left">
          <ImageCarousel images={product.images} productName={product.name} />

          <div className="pdp__actions">
            <button
              className="pdp__btn pdp__btn--cart"
              onClick={handleAddToCart}
              disabled={addingToCart || product.stock === 0}
              id="add-to-cart-btn"
            >
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path
                  fill="currentColor"
                  d="M11 9h2V6h3V4h-3V1h-2v3H8v2h3v3zm-4 9c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zm-9.83-3.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0020 4H5.21l-.94-2H1v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25z"
                />
              </svg>
              {addingToCart ? 'ADDING...' : 'ADD TO CART'}
            </button>
            <button
              className="pdp__btn pdp__btn--buy"
              onClick={handleBuyNow}
              disabled={addingToCart || product.stock === 0}
              id="buy-now-btn"
            >
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path
                  fill="currentColor"
                  d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"
                />
              </svg>
              BUY NOW
            </button>
            <button
              className={`pdp__btn pdp__btn--wishlist ${product && isWishlisted(product.id) ? 'pdp__btn--wishlisted' : ''}`}
              onClick={() => {
                if (!product) return;
                if (!requireAuth()) return;
                toggleWishlist(product.id);
              }}
              id="wishlist-btn"
            >
              <svg viewBox="0 0 24 24" width="18" height="18">
                {product && isWishlisted(product.id) ? (
                  <path fill="#ff4081" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                ) : (
                  <path fill="none" stroke="currentColor" strokeWidth="1.8" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                )}
              </svg>
              {product && isWishlisted(product.id) ? 'WISHLISTED' : 'WISHLIST'}
            </button>
          </div>
        </div>

        {/* Right — Details */}
        <div className="pdp__right">
          {product.category_name && (
            <p className="pdp__breadcrumb">
              Home › {product.category_name}
            </p>
          )}

          <h1 className="pdp__title">{product.name}</h1>

          {/* Rating */}
          <div className="pdp__rating">
            <span className="pdp__rating-badge">
              {product.rating.toFixed(1)} ★
            </span>
            <span className="pdp__rating-count">
              {product.rating_count.toLocaleString('en-IN')} Ratings & Reviews
            </span>
          </div>

          <p className="pdp__special-price">Special Price</p>

          {/* Price */}
          <div className="pdp__price-row">
            <span className="pdp__price">{formatPrice(product.price)}</span>
            {product.original_price && product.original_price > product.price && (
              <>
                <span className="pdp__original-price">
                  {formatPrice(product.original_price)}
                </span>
                <span className="pdp__discount">
                  {product.discount_percent}% off
                </span>
              </>
            )}
          </div>

          {/* Stock */}
          <div className="pdp__stock">
            {product.stock > 0 ? (
              <span className="pdp__stock--in">
                In Stock ({product.stock} available)
              </span>
            ) : (
              <span className="pdp__stock--out">Out of Stock</span>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div className="pdp__section">
              <h2 className="pdp__section-title">Description</h2>
              <p className="pdp__description">{product.description}</p>
            </div>
          )}

          {/* Specifications */}
          {Object.keys(specs).length > 0 && (
            <div className="pdp__section">
              <h2 className="pdp__section-title">Specifications</h2>
              <table className="pdp__specs-table" id="specs-table">
                <tbody>
                  {Object.entries(specs).map(([key, value]) => (
                    <tr key={key}>
                      <td className="pdp__spec-key">{key}</td>
                      <td className="pdp__spec-val">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
