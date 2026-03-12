import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './CartPage.css';

export default function CartPage() {
  const { cart, loading, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  const formatPrice = (p: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(p);

  if (loading) {
    return (
      <div className="cart-page container">
        <div className="home__loading">
          <div className="home__spinner" />
          <p>Loading cart…</p>
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="cart-page container" id="cart-page">
        <div className="cart-page__empty">
          <svg viewBox="0 0 24 24" width="80" height="80">
            <path
              fill="#ddd"
              d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0020 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"
            />
          </svg>
          <h2>Your cart is empty!</h2>
          <p>Add items to it now.</p>
          <Link to="/" className="cart-page__shop-btn">
            Shop Now
          </Link>
        </div>
      </div>
    );
  }

  const totalDiscount = cart.items.reduce((acc, item) => {
    if (item.product.original_price && item.product.original_price > item.product.price) {
      return acc + (item.product.original_price - item.product.price) * item.quantity;
    }
    return acc;
  }, 0);

  return (
    <main className="cart-page container" id="cart-page">
      <div className="cart-page__layout">
        {/* Cart items */}
        <div className="cart-page__items">
          <div className="cart-page__header">
            <h1>My Cart ({cart.total_items})</h1>
          </div>

          {cart.items.map((item) => (
            <div className="cart-item" key={item.id} id={`cart-item-${item.id}`}>
              <Link to={`/product/${item.product_id}`} className="cart-item__img-wrap">
                <img
                  src={
                    item.product.image_url ||
                    'https://via.placeholder.com/112x112?text=No+Image'
                  }
                  alt={item.product.name}
                />
              </Link>

              <div className="cart-item__details">
                <Link to={`/product/${item.product_id}`} className="cart-item__name">
                  {item.product.name}
                </Link>
                {item.product.brand && (
                  <p className="cart-item__brand">{item.product.brand}</p>
                )}

                <div className="cart-item__price-row">
                  <span className="cart-item__price">
                    {formatPrice(item.product.price)}
                  </span>
                  {item.product.original_price &&
                    item.product.original_price > item.product.price && (
                      <>
                        <span className="cart-item__original-price">
                          {formatPrice(item.product.original_price)}
                        </span>
                        <span className="cart-item__discount">
                          {item.product.discount_percent}% off
                        </span>
                      </>
                    )}
                </div>

                {/* Quantity controls */}
                <div className="cart-item__qty">
                  <button
                    className="cart-item__qty-btn"
                    disabled={item.quantity <= 1}
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    −
                  </button>
                  <span className="cart-item__qty-value">{item.quantity}</span>
                  <button
                    className="cart-item__qty-btn"
                    disabled={item.quantity >= item.product.stock}
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                  <button
                    className="cart-item__remove"
                    onClick={() => removeItem(item.id)}
                  >
                    REMOVE
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="cart-page__place-order">
            <button
              className="cart-page__checkout-btn"
              onClick={() => navigate('/checkout')}
              id="place-order-btn"
            >
              PLACE ORDER
            </button>
          </div>
        </div>

        {/* Price summary */}
        <div className="cart-page__summary" id="price-summary">
          <h2 className="cart-page__summary-title">PRICE DETAILS</h2>

          <div className="cart-page__summary-row">
            <span>Price ({cart.total_items} items)</span>
            <span>{formatPrice(Number(cart.subtotal) + totalDiscount)}</span>
          </div>

          <div className="cart-page__summary-row cart-page__summary-row--discount">
            <span>Discount</span>
            <span>− {formatPrice(totalDiscount)}</span>
          </div>

          <div className="cart-page__summary-row">
            <span>Delivery Charges</span>
            <span className="cart-page__free">FREE</span>
          </div>

          <div className="cart-page__summary-total">
            <span>Total Amount</span>
            <span>{formatPrice(Number(cart.total))}</span>
          </div>

          {totalDiscount > 0 && (
            <p className="cart-page__savings">
              You will save {formatPrice(totalDiscount)} on this order
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
