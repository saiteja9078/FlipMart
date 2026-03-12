import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchOrder, cancelOrder } from '../../api/client';
import type { OrderResponse } from '../../types';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import './OrderConfirmationPage.css';

export default function OrderConfirmationPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    if (!orderNumber) return;
    setLoading(true);
    fetchOrder(orderNumber)
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [orderNumber]);

  const formatPrice = (p: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(p);

  const handleCancel = async () => {
    if (!order) return;
    setShowCancelModal(false);
    setCancelling(true);
    try {
      const updated = await cancelOrder(order.order_number);
      setOrder(updated);
    } catch (err: any) {
      const message = err?.response?.data?.detail || 'Failed to cancel order';
      alert(message);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="confirmation container">
        <div className="home__loading">
          <div className="home__spinner" />
          <p>Loading order…</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="confirmation container">
        <div className="confirmation__error">
          <h2>Order not found</h2>
          <Link to="/">Go back to home</Link>
        </div>
      </div>
    );
  }

  const isCancelled = order.status === 'cancelled';

  return (
    <main className="confirmation container" id="order-confirmation-page">
      {/* Cancel confirmation modal */}
      <ConfirmModal
        open={showCancelModal}
        title="Cancel Order?"
        message={`Are you sure you want to cancel order ${order.order_number}? This action cannot be undone and the refund will be processed to your original payment method.`}
        confirmText="Yes, Cancel Order"
        cancelText="No, Keep Order"
        variant="danger"
        onConfirm={handleCancel}
        onCancel={() => setShowCancelModal(false)}
      />

      {/* Banner */}
      <div className={`confirmation__banner ${isCancelled ? 'confirmation__banner--cancelled' : ''}`}>
        <div className="confirmation__check">
          {isCancelled ? (
            <svg viewBox="0 0 24 24" width="48" height="48">
              <path fill="#fff" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="48" height="48">
              <path fill="#fff" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          )}
        </div>
        <h1>{isCancelled ? 'Order Cancelled' : 'Order Placed Successfully!'}</h1>
        <p className="confirmation__order-id">
          Order ID: <strong>{order.order_number}</strong>
        </p>
      </div>

      <div className="confirmation__layout">
        {/* Order details */}
        <div className="confirmation__details">
          <h2>Order Details</h2>

          <div className="confirmation__items">
            {order.items.map((item) => (
              <div className="confirmation__item" key={item.id}>
                {item.product_image && (
                  <img
                    src={item.product_image}
                    alt={item.product_name}
                    className="confirmation__item-img"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect fill="#f5f5f5" width="80" height="80"/><text fill="#ccc" font-family="Arial" font-size="10" x="50%" y="50%" text-anchor="middle" dy="3">No Image</text></svg>');
                    }}
                  />
                )}
                <div className="confirmation__item-info">
                  <p className="confirmation__item-name">{item.product_name}</p>
                  <p className="confirmation__item-qty">Qty: {item.quantity}</p>
                  <p className="confirmation__item-price">
                    {formatPrice(item.price_at_purchase * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="confirmation__total">
            <span>Total Amount</span>
            <span>{formatPrice(Number(order.total_amount))}</span>
          </div>
        </div>

        {/* Shipping info */}
        <div className="confirmation__shipping">
          <h2>Delivery Address</h2>
          <div className="confirmation__address-card">
            <p className="confirmation__address-name">{order.shipping_name}</p>
            <p>{order.shipping_address}</p>
            <p>
              {order.shipping_city}, {order.shipping_state} — {order.shipping_pincode}
            </p>
            <p>Phone: {order.shipping_phone}</p>
          </div>

          <div className="confirmation__status">
            <span className={`confirmation__status-badge confirmation__status-badge--${order.status}`}>
              {order.status.toUpperCase()}
            </span>
            <span className="confirmation__date">
              {new Date(order.created_at).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="confirmation__actions">
        <Link to="/" className="confirmation__continue-btn">
          Continue Shopping
        </Link>
        <Link to="/orders" className="confirmation__orders-btn">
          View All Orders
        </Link>
        {order.status === 'confirmed' && (
          <button
            className="confirmation__cancel-btn"
            onClick={() => setShowCancelModal(true)}
            disabled={cancelling}
            id="cancel-order-btn"
          >
            {cancelling ? 'Cancelling…' : 'Cancel Order'}
          </button>
        )}
      </div>
    </main>
  );
}
