import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './AuthModal.css';

export default function AuthModal() {
  const { showAuthModal, setShowAuthModal, login, signup } = useAuth();
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!showAuthModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (tab === 'login') {
        await login(email, password);
      } else {
        if (!name.trim()) {
          setError('Name is required');
          setLoading(false);
          return;
        }
        await signup(name, email, password);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Something went wrong';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (t: 'login' | 'signup') => {
    setTab(t);
    setError('');
  };

  return (
    <div className="auth-modal__overlay" onClick={() => setShowAuthModal(false)}>
      <div
        className="auth-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          className="auth-modal__close"
          onClick={() => setShowAuthModal(false)}
          aria-label="Close"
        >
          ✕
        </button>

        <div className="auth-modal__left">
          <h2>{tab === 'login' ? 'Login' : 'Sign Up'}</h2>
          <p>
            {tab === 'login'
              ? 'Get access to your Orders, Wishlist and Recommendations'
              : 'Create an account to start shopping'}
          </p>
          <div className="auth-modal__art">
            <svg viewBox="0 0 24 24" width="80" height="80">
              <path fill="rgba(255,255,255,0.3)" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
          </div>
        </div>

        <div className="auth-modal__right">
          <div className="auth-modal__tabs">
            <button
              className={`auth-modal__tab ${tab === 'login' ? 'auth-modal__tab--active' : ''}`}
              onClick={() => switchTab('login')}
            >
              Login
            </button>
            <button
              className={`auth-modal__tab ${tab === 'signup' ? 'auth-modal__tab--active' : ''}`}
              onClick={() => switchTab('signup')}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-modal__form">
            {tab === 'signup' && (
              <div className="auth-modal__field">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  id="auth-name"
                />
              </div>
            )}
            <div className="auth-modal__field">
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                id="auth-email"
              />
            </div>
            <div className="auth-modal__field auth-modal__field--password">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={4}
                id="auth-password"
              />
              <button
                type="button"
                className="auth-modal__eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path fill="currentColor" d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path fill="currentColor" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                  </svg>
                )}
              </button>
            </div>

            {error && <p className="auth-modal__error">{error}</p>}

            <button
              type="submit"
              className="auth-modal__submit"
              disabled={loading}
              id="auth-submit"
            >
              {loading ? 'Please wait…' : tab === 'login' ? 'Login' : 'Create Account'}
            </button>
          </form>

          <p className="auth-modal__switch">
            {tab === 'login' ? (
              <>New to FlipMart? <button onClick={() => switchTab('signup')}>Create account</button></>
            ) : (
              <>Already have an account? <button onClick={() => switchTab('login')}>Login</button></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
