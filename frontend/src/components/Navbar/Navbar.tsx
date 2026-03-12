import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { cart } = useCart();
  const { user, isAuthenticated, setShowAuthModal, logout } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="navbar" id="main-navbar">
      <div className="navbar__inner container">
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <div className="navbar__logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M8 8V7a4 4 0 0 1 8 0v1" stroke="#FFE500" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
              <rect x="5" y="9" width="14" height="12" rx="2" fill="#FFE500"/>
              <path d="M9 12v1.5a3 3 0 0 0 6 0V12" stroke="#2874f0" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="navbar__logo-text-wrap">
            <span className="navbar__logo-text">FlipMart</span>
            <span className="navbar__tagline">
              Explore <span className="navbar__tagline-plus">Plus</span>
              <svg width="10" height="10" viewBox="0 0 10 10" className="navbar__plus-icon">
                <circle cx="5" cy="5" r="5" fill="#FFE500"/>
                <text x="5" y="7.5" textAnchor="middle" fill="#2874f0" fontSize="7" fontWeight="bold">+</text>
              </svg>
            </span>
          </div>
        </Link>

        {/* Search */}
        <form className="navbar__search" onSubmit={handleSearch} id="search-form">
          <input
            type="text"
            className="navbar__search-input"
            placeholder="Search for Products, Brands and More"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            id="search-input"
          />
          <button className="navbar__search-btn" type="submit" aria-label="Search">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path
                fill="#2874f0"
                d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
              />
            </svg>
          </button>
        </form>

        {/* Nav Links */}
        <nav className="navbar__links">
          {/* User / Login */}
          <div className="navbar__user-wrap" ref={userMenuRef}>
            {isAuthenticated ? (
              <>
                <button
                  className="navbar__link navbar__user-btn"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  id="user-menu-btn"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                  <span>{user!.name.split(' ')[0]}</span>
                  <svg viewBox="0 0 24 24" width="12" height="12" className="navbar__chevron">
                    <path fill="currentColor" d="M7 10l5 5 5-5z"/>
                  </svg>
                </button>

                {showUserMenu && (
                  <div className="navbar__dropdown">
                    <div className="navbar__dropdown-header">
                      <p className="navbar__dropdown-name">{user!.name}</p>
                      <p className="navbar__dropdown-email">{user!.email}</p>
                    </div>
                    <Link to="/orders" className="navbar__dropdown-item" onClick={() => setShowUserMenu(false)}>
                      <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                      My Orders
                    </Link>
                    <Link to="/wishlist" className="navbar__dropdown-item" onClick={() => setShowUserMenu(false)}>
                      <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                      Wishlist
                    </Link>
                    <button className="navbar__dropdown-item navbar__dropdown-logout" onClick={() => { logout(); setShowUserMenu(false); }}>
                      <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>
                      Logout
                    </button>
                  </div>
                )}
              </>
            ) : (
              <button
                className="navbar__link navbar__login-btn"
                onClick={() => setShowAuthModal(true)}
                id="login-btn"
              >
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
                <span>Login</span>
              </button>
            )}
          </div>

          <Link to="/cart" className="navbar__link navbar__link--cart" id="cart-link">
            <div className="navbar__cart-icon-wrap">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path
                  fill="currentColor"
                  d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0020 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"
                />
              </svg>
              {cart.total_items > 0 && (
                <span className="navbar__cart-badge" id="cart-badge">
                  {cart.total_items}
                </span>
              )}
            </div>
            <span>Cart</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
