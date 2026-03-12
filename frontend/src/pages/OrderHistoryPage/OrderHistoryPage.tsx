import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchOrders } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import type { OrderResponse } from '../../types';
import './OrderHistoryPage.css';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      setOrders([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchOrders()
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const formatPrice = (p: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(p);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  if (loading) {
    return (
      <div className="orders-page container">
        <div className="home__loading">
          <div className="home__spinner" />
          <p>Loading orders…</p>
        </div>
      </div>
    );
  }

  return (
    <main className="orders-page container" id="orders-page">
      <h1 className="orders-page__title">My Orders</h1>

      {orders.length === 0 ? (
        <div className="orders-page__empty">
          <svg viewBox="0 0 24 24" width="72" height="72">
            <path
              fill="#ddd"
              d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"
            />
          </svg>
          <h2>No orders yet</h2>
          <p>Start shopping to see your orders here!</p>
          <Link to="/" className="orders-page__shop-btn">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="orders-page__list">
          {orders.map((order) => (
            <Link
              to={`/order-confirmation/${order.order_number}`}
              key={order.id}
              className="order-card"
              id={`order-${order.order_number}`}
            >
              <div className="order-card__header">
                <div className="order-card__meta">
                  <span className="order-card__number">{order.order_number}</span>
                  <span className="order-card__date">{formatDate(order.created_at)}</span>
                </div>
                <span className={`order-card__status order-card__status--${order.status}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>

              <div className="order-card__items">
                {order.items.slice(0, 3).map((item) => (
                  <div className="order-card__item" key={item.id}>
                    {item.product_image && (
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="order-card__item-img"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://via.placeholder.com/56x56?text=Item';
                        }}
                      />
                    )}
                    <div className="order-card__item-info">
                      <p className="order-card__item-name">{item.product_name}</p>
                      <p className="order-card__item-qty">
                        Qty: {item.quantity} × {formatPrice(item.price_at_purchase)}
                      </p>
                    </div>
                  </div>
                ))}
                {order.items.length > 3 && (
                  <p className="order-card__more">
                    +{order.items.length - 3} more item{order.items.length - 3 > 1 ? 's' : ''}
                  </p>
                )}
              </div>

              <div className="order-card__footer">
                <span className="order-card__total">
                  Total: {formatPrice(Number(order.total_amount))}
                </span>
                <span className="order-card__view">View Details →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
