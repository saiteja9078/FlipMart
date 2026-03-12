import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { CartResponse } from '../types';
import {
  fetchCart,
  addToCart as apiAddToCart,
  updateCartItem as apiUpdateCartItem,
  removeCartItem as apiRemoveCartItem,
} from '../api/client';
import { useAuth } from './AuthContext';

/* ---------- Context shape ---------- */
interface CartContextType {
  cart: CartResponse;
  loading: boolean;
  updating: boolean;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  refreshCart: () => Promise<void>;
}

const emptyCart: CartResponse = {
  items: [],
  total_items: 0,
  subtotal: 0,
  total: 0,
};

const CartContext = createContext<CartContextType | undefined>(undefined);

/* ---------- Provider ---------- */
export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartResponse>(emptyCart);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const { isAuthenticated, requireAuth } = useAuth();

  const refreshCart = useCallback(async () => {
    try {
      const data = await fetchCart();
      setCart(data);
    } catch (err) {
      console.error('Failed to fetch cart', err);
    }
  }, []);

  // Fetch cart on login / auth change
  useEffect(() => {
    if (isAuthenticated) {
      setLoading(true);
      fetchCart()
        .then(setCart)
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setCart(emptyCart);
    }
  }, [isAuthenticated]);

  const addToCart = useCallback(
    async (productId: number, quantity = 1) => {
      // Forcefully check the latest auth state here
      if (!isAuthenticated) {
        requireAuth(); // this triggers the modal
        return;
      }
      setUpdating(true);
      try {
        await apiAddToCart(productId, quantity);
        await refreshCart();
      } finally {
        setUpdating(false);
      }
    },
    [refreshCart, isAuthenticated, requireAuth]
  );

  const updateQuantity = useCallback(
    async (itemId: number, quantity: number) => {
      setCart((prev) => {
        const newItems = prev.items.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        );
        const subtotal = newItems.reduce(
          (sum, item) => sum + item.product.price * item.quantity, 0
        );
        const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
        return { ...prev, items: newItems, subtotal, total: subtotal, total_items: totalItems };
      });

      try {
        await apiUpdateCartItem(itemId, quantity);
        await refreshCart();
      } catch (err) {
        console.error('Failed to update quantity', err);
        await refreshCart();
      }
    },
    [refreshCart]
  );

  const removeItem = useCallback(
    async (itemId: number) => {
      setCart((prev) => {
        const newItems = prev.items.filter((item) => item.id !== itemId);
        const subtotal = newItems.reduce(
          (sum, item) => sum + item.product.price * item.quantity, 0
        );
        const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
        return { ...prev, items: newItems, subtotal, total: subtotal, total_items: totalItems };
      });

      try {
        await apiRemoveCartItem(itemId);
        await refreshCart();
      } catch (err) {
        console.error('Failed to remove item', err);
        await refreshCart();
      }
    },
    [refreshCart]
  );

  return (
    <CartContext.Provider
      value={{ cart, loading, updating, addToCart, updateQuantity, removeItem, refreshCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

/* ---------- Hook ---------- */
export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
