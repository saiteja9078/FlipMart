import axios from 'axios';
import type {
  ProductListResponse,
  ProductDetail,
  Category,
  CartResponse,
  CartItem,
  OrderCreate,
  OrderResponse,
  TokenResponse,
  WishlistItem,
  Address,
  AddressCreate,
} from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' },
});

/* -------- Auth interceptor -------- */
export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('flipmart_token');
  if (token) {
    if (config.headers && typeof config.headers.set === 'function') {
      config.headers.set('Authorization', `Bearer ${token}`);
    } else if (config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`; // fallback
    }
  } else {
    console.warn('Axios Interceptor: No flipmart_token found in localStorage');
  }
  return config;
}, (error) => Promise.reject(error));

// Restore token from localStorage on load
const savedToken = localStorage.getItem('flipmart_token');
if (savedToken) setAuthToken(savedToken);

/* -------- Auth -------- */
export const apiSignup = async (
  name: string, email: string, password: string
): Promise<TokenResponse> => {
  const { data } = await api.post<TokenResponse>('/auth/signup', { name, email, password });
  return data;
};

export const apiLogin = async (
  email: string, password: string
): Promise<TokenResponse> => {
  const { data } = await api.post<TokenResponse>('/auth/login', { email, password });
  return data;
};

export const apiGetMe = async (): Promise<TokenResponse['user']> => {
  const { data } = await api.get('/auth/me');
  return data;
};

/* -------- Categories -------- */
export const fetchCategories = async (): Promise<Category[]> => {
  const { data } = await api.get<Category[]>('/categories/');
  return data;
};

/* -------- Products -------- */
interface ProductQueryParams {
  search?: string;
  category_id?: number;
  min_price?: number;
  max_price?: number;
  brand?: string;
  sort_by?: string;
  page?: number;
  limit?: number;
}

export const fetchProducts = async (
  params: ProductQueryParams = {}
): Promise<ProductListResponse> => {
  const { data } = await api.get<ProductListResponse>('/products/', { params });
  return data;
};

export const fetchBrands = async (categoryId?: number): Promise<string[]> => {
  const params = categoryId ? { category_id: categoryId } : {};
  const { data } = await api.get<string[]>('/products/brands', { params });
  return data;
};

export const fetchProduct = async (id: number): Promise<ProductDetail> => {
  const { data } = await api.get<ProductDetail>(`/products/${id}`);
  return data;
};

/* -------- Cart -------- */
export const fetchCart = async (): Promise<CartResponse> => {
  const { data } = await api.get<CartResponse>('/cart/');
  return data;
};

export const addToCart = async (
  product_id: number,
  quantity: number = 1
): Promise<CartItem> => {
  const { data } = await api.post<CartItem>('/cart/', { product_id, quantity });
  return data;
};

export const updateCartItem = async (
  itemId: number,
  quantity: number
): Promise<CartItem> => {
  const { data } = await api.put<CartItem>(`/cart/${itemId}`, { quantity });
  return data;
};

export const removeCartItem = async (itemId: number): Promise<void> => {
  await api.delete(`/cart/${itemId}`);
};

/* -------- Orders -------- */
export const fetchOrders = async (): Promise<OrderResponse[]> => {
  const { data } = await api.get<OrderResponse[]>('/orders/');
  return data;
};

export const placeOrder = async (
  orderData: OrderCreate
): Promise<OrderResponse> => {
  const { data } = await api.post<OrderResponse>('/orders/', orderData);
  return data;
};

export const fetchOrder = async (
  orderNumber: string
): Promise<OrderResponse> => {
  const { data } = await api.get<OrderResponse>(`/orders/${orderNumber}`);
  return data;
};

export const cancelOrder = async (
  orderNumber: string
): Promise<OrderResponse> => {
  const { data } = await api.patch<OrderResponse>(`/orders/${orderNumber}/cancel`);
  return data;
};

/* -------- Wishlist -------- */
export const fetchWishlist = async (): Promise<WishlistItem[]> => {
  const { data } = await api.get<WishlistItem[]>('/wishlist/');
  return data;
};

export const addToWishlist = async (productId: number): Promise<WishlistItem> => {
  const { data } = await api.post<WishlistItem>(`/wishlist/${productId}`);
  return data;
};

export const removeFromWishlist = async (productId: number): Promise<void> => {
  await api.delete(`/wishlist/${productId}`);
};

/* -------- Addresses -------- */
export const fetchAddresses = async (): Promise<Address[]> => {
  const { data } = await api.get<Address[]>('/addresses/');
  return data;
};

export const createAddress = async (address: AddressCreate): Promise<Address> => {
  const { data } = await api.post<Address>('/addresses/', address);
  return data;
};

export const updateAddress = async (
  addressId: number, address: Partial<AddressCreate>
): Promise<Address> => {
  const { data } = await api.put<Address>(`/addresses/${addressId}`, address);
  return data;
};

export const deleteAddress = async (addressId: number): Promise<void> => {
  await api.delete(`/addresses/${addressId}`);
};

export default api;
