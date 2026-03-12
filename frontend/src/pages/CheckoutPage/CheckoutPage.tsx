import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { placeOrder, fetchAddresses, createAddress, deleteAddress } from '../../api/client';
import type { OrderCreate, Address, AddressCreate } from '../../types';
import './CheckoutPage.css';

const emptyForm: AddressCreate = {
  name: '',
  phone: '',
  address_line: '',
  city: '',
  state: '',
  pincode: '',
  is_default: false,
};

export default function CheckoutPage() {
  const { cart, refreshCart } = useCart();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Address state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newAddr, setNewAddr] = useState<AddressCreate>({ ...emptyForm });
  const [savingAddr, setSavingAddr] = useState(false);

  const formatPrice = (p: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(p);

  // Load saved addresses
  useEffect(() => {
    fetchAddresses()
      .then((data) => {
        setAddresses(data);
        // Auto-select default address
        const def = data.find((a) => a.is_default);
        if (def) setSelectedAddressId(def.id);
        else if (data.length > 0) setSelectedAddressId(data[0].id);
        // If no addresses, show the form
        if (data.length === 0) setShowNewForm(true);
      })
      .catch(console.error)
      .finally(() => setLoadingAddresses(false));
  }, []);

  const handleNewAddrChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewAddr({ ...newAddr, [e.target.name]: e.target.value });
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAddr(true);
    try {
      const saved = await createAddress({
        ...newAddr,
        is_default: addresses.length === 0,
      });
      setAddresses((prev) => [...prev, saved]);
      setSelectedAddressId(saved.id);
      setShowNewForm(false);
      setNewAddr({ ...emptyForm });
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Failed to save address.');
    } finally {
      setSavingAddr(false);
    }
  };

  const handleDeleteAddress = async (id: number) => {
    try {
      await deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      if (selectedAddressId === id) {
        const remaining = addresses.filter((a) => a.id !== id);
        setSelectedAddressId(remaining.length > 0 ? remaining[0].id : null);
        if (remaining.length === 0) setShowNewForm(true);
      }
    } catch {
      setError('Failed to delete address.');
    }
  };

  const handleSubmit = async () => {
    setError('');
    const selected = addresses.find((a) => a.id === selectedAddressId);
    if (!selected) {
      setError('Please select a delivery address.');
      return;
    }
    setSubmitting(true);

    const orderData: OrderCreate = {
      shipping_name: selected.name,
      shipping_address: selected.address_line,
      shipping_city: selected.city,
      shipping_state: selected.state,
      shipping_pincode: selected.pincode,
      shipping_phone: selected.phone,
    };

    try {
      const order = await placeOrder(orderData);
      await refreshCart();
      navigate(`/order-confirmation/${order.order_number}`);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="checkout container" id="checkout-page">
        <div className="cart-page__empty">
          <h2>Your cart is empty</h2>
          <p>Add items before checkout.</p>
          <button onClick={() => navigate('/')} className="cart-page__shop-btn">
            Shop Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="checkout container" id="checkout-page">
      <div className="checkout__layout">
        {/* Address Section */}
        <div className="checkout__form">
          <h1 className="checkout__heading">
            <span className="checkout__step">1</span>
            DELIVERY ADDRESS
          </h1>

          {error && <p className="checkout__error">{error}</p>}

          {loadingAddresses ? (
            <p className="checkout__loading">Loading saved addresses...</p>
          ) : (
            <>
              {/* Saved address list */}
              {addresses.length > 0 && (
                <div className="checkout__addresses">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`checkout__address-card${selectedAddressId === addr.id ? ' checkout__address-card--selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="selected_address"
                        value={addr.id}
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="checkout__address-radio"
                      />
                      <div className="checkout__address-body">
                        <div className="checkout__address-top">
                          <span className="checkout__address-name">{addr.name}</span>
                          <span className="checkout__address-phone">{addr.phone}</span>
                          {addr.is_default && (
                            <span className="checkout__address-badge">Default</span>
                          )}
                        </div>
                        <p className="checkout__address-line">
                          {addr.address_line}, {addr.city}, {addr.state} — {addr.pincode}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="checkout__address-delete"
                        title="Delete address"
                        onClick={(e) => {
                          e.preventDefault();
                          handleDeleteAddress(addr.id);
                        }}
                      >
                        ✕
                      </button>
                    </label>
                  ))}
                </div>
              )}

              {/* Add new address toggle */}
              {!showNewForm && (
                <button
                  type="button"
                  className="checkout__add-btn"
                  onClick={() => setShowNewForm(true)}
                >
                  <span className="checkout__add-icon">+</span>
                  Add a new address
                </button>
              )}

              {/* New address form */}
              {showNewForm && (
                <form className="checkout__new-addr" onSubmit={handleSaveAddress}>
                  <h3 className="checkout__new-addr-title">New Address</h3>
                  <div className="checkout__fields">
                    <div className="checkout__field">
                      <label htmlFor="new_name">Full Name *</label>
                      <input
                        id="new_name"
                        name="name"
                        type="text"
                        required
                        minLength={2}
                        value={newAddr.name}
                        onChange={handleNewAddrChange}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="checkout__field">
                      <label htmlFor="new_phone">Phone Number *</label>
                      <input
                        id="new_phone"
                        name="phone"
                        type="tel"
                        required
                        minLength={10}
                        maxLength={15}
                        value={newAddr.phone}
                        onChange={handleNewAddrChange}
                        placeholder="10-digit mobile number"
                      />
                    </div>
                    <div className="checkout__field checkout__field--full">
                      <label htmlFor="new_address_line">Address *</label>
                      <textarea
                        id="new_address_line"
                        name="address_line"
                        required
                        minLength={5}
                        value={newAddr.address_line}
                        onChange={handleNewAddrChange}
                        placeholder="House no., Building, Street, Area"
                        rows={3}
                      />
                    </div>
                    <div className="checkout__field">
                      <label htmlFor="new_city">City *</label>
                      <input
                        id="new_city"
                        name="city"
                        type="text"
                        required
                        value={newAddr.city}
                        onChange={handleNewAddrChange}
                        placeholder="City"
                      />
                    </div>
                    <div className="checkout__field">
                      <label htmlFor="new_state">State *</label>
                      <input
                        id="new_state"
                        name="state"
                        type="text"
                        required
                        value={newAddr.state}
                        onChange={handleNewAddrChange}
                        placeholder="State"
                      />
                    </div>
                    <div className="checkout__field">
                      <label htmlFor="new_pincode">Pincode *</label>
                      <input
                        id="new_pincode"
                        name="pincode"
                        type="text"
                        required
                        minLength={5}
                        maxLength={10}
                        value={newAddr.pincode}
                        onChange={handleNewAddrChange}
                        placeholder="6-digit pincode"
                      />
                    </div>
                  </div>
                  <div className="checkout__new-addr-actions">
                    <button
                      type="submit"
                      className="checkout__save-addr-btn"
                      disabled={savingAddr}
                    >
                      {savingAddr ? 'Saving...' : 'Save Address'}
                    </button>
                    {addresses.length > 0 && (
                      <button
                        type="button"
                        className="checkout__cancel-addr-btn"
                        onClick={() => {
                          setShowNewForm(false);
                          setNewAddr({ ...emptyForm });
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              )}

              {/* Place order button */}
              {addresses.length > 0 && selectedAddressId && (
                <button
                  className="checkout__submit"
                  disabled={submitting}
                  onClick={handleSubmit}
                  id="confirm-order-btn"
                >
                  {submitting ? 'PLACING ORDER...' : 'CONFIRM ORDER'}
                </button>
              )}
            </>
          )}
        </div>

        {/* Order Summary */}
        <div className="checkout__summary">
          <h2 className="checkout__summary-title">ORDER SUMMARY</h2>

          <div className="checkout__summary-items">
            {cart.items.map((item) => (
              <div className="checkout__summary-item" key={item.id}>
                <img
                  src={item.product.image_url || ''}
                  alt={item.product.name}
                  className="checkout__summary-img"
                />
                <div className="checkout__summary-info">
                  <p className="checkout__summary-name">{item.product.name}</p>
                  <p className="checkout__summary-qty">Qty: {item.quantity}</p>
                  <p className="checkout__summary-price">
                    {formatPrice(item.product.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="checkout__summary-total">
            <span>Total</span>
            <span>{formatPrice(Number(cart.total))}</span>
          </div>
        </div>
      </div>
    </main>
  );
}
