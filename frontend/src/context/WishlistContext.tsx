import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import {
  fetchWishlist,
  addToWishlist as apiAdd,
  removeFromWishlist as apiRemove,
} from '../api/client';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  /** Set of product IDs currently in the wishlist */
  wishlistedIds: Set<number>;
  /** Toggle a product in/out of the wishlist. Returns true if added, false if removed. */
  toggleWishlist: (productId: number) => Promise<boolean>;
  /** Check if a product is wishlisted */
  isWishlisted: (productId: number) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistedIds, setWishlistedIds] = useState<Set<number>>(new Set());
  const { isAuthenticated } = useAuth();

  // Load wishlist on auth change
  useEffect(() => {
    if (!isAuthenticated) {
      setWishlistedIds(new Set());
      return;
    }
    fetchWishlist()
      .then((items) => {
        setWishlistedIds(new Set(items.map((i) => i.product_id)));
      })
      .catch(console.error);
  }, [isAuthenticated]);

  const isWishlisted = useCallback(
    (productId: number) => wishlistedIds.has(productId),
    [wishlistedIds],
  );

  const toggleWishlist = useCallback(
    async (productId: number): Promise<boolean> => {
      if (wishlistedIds.has(productId)) {
        // Optimistic remove
        setWishlistedIds((prev) => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
        try {
          await apiRemove(productId);
        } catch {
          // Revert on failure
          setWishlistedIds((prev) => new Set(prev).add(productId));
        }
        return false;
      } else {
        // Optimistic add
        setWishlistedIds((prev) => new Set(prev).add(productId));
        try {
          await apiAdd(productId);
        } catch {
          // Revert on failure
          setWishlistedIds((prev) => {
            const next = new Set(prev);
            next.delete(productId);
            return next;
          });
        }
        return true;
      }
    },
    [wishlistedIds],
  );

  return (
    <WishlistContext.Provider value={{ wishlistedIds, toggleWishlist, isWishlisted }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextType {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within a WishlistProvider');
  return ctx;
}
