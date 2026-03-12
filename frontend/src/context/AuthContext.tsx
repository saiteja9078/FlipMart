import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { User } from '../types';
import { apiSignup, apiLogin, apiGetMe, setAuthToken } from '../api/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  requireAuth: () => boolean; // returns true if authenticated, else opens modal
  showAuthModal: boolean;
  setShowAuthModal: (v: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem('flipmart_token');
    if (token) {
      setAuthToken(token);
      apiGetMe()
        .then(setUser)
        .catch(() => {
          // Token expired or invalid
          localStorage.removeItem('flipmart_token');
          setAuthToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    localStorage.setItem('flipmart_token', res.access_token);
    setAuthToken(res.access_token);
    setUser(res.user);
    setShowAuthModal(false);
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    const res = await apiSignup(name, email, password);
    localStorage.setItem('flipmart_token', res.access_token);
    setAuthToken(res.access_token);
    setUser(res.user);
    setShowAuthModal(false);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('flipmart_token');
    setAuthToken(null);
    setUser(null);
  }, []);

  const requireAuth = useCallback(() => {
    if (user) return true;
    setShowAuthModal(true);
    return false;
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        requireAuth,
        showAuthModal,
        setShowAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
