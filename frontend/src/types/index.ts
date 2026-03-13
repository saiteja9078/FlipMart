/* ---------- Product Image Interface ---------- */
export interface ProductImage {
  id: number;
  image_url: string;
  display_order: number;
}

/* ---------- Product (Brief — listing cards) ---------- */
export interface ProductBrief {
  id: number;
  name: string;
  slug: string;
  price: number;
  original_price: number | null;
  discount_percent: number;
  brand: string | null;
  rating: number;
  rating_count: number;
  stock: number;
  image_url: string | null;
  category_name: string | null;
}

/* ---------- Product (Full — detail page) ---------- */
export interface ProductDetail {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  specifications: string | null;
  price: number;
  original_price: number | null;
  discount_percent: number;
  stock: number;
  brand: string | null;
  rating: number;
  rating_count: number;
  category_id: number;
  category_name: string | null;
  images: ProductImage[];
}

/* ---------- Product List Response (paginated) ---------- */
export interface ProductListResponse {
  products: ProductBrief[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

/* ---------- Category ---------- */
export interface Category {
  id: number;
  name: string;
  slug: string;
  image_url: string | null;
}

/* ---------- Cart ---------- */
export interface CartProductInfo {
  id: number;
  name: string;
  price: number;
  original_price: number | null;
  discount_percent: number;
  stock: number;
  brand: string | null;
  image_url: string | null;
}

export interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  product: CartProductInfo;
}

export interface CartResponse {
  items: CartItem[];
  total_items: number;
  subtotal: number;
  total: number;
}

/* ---------- Order ---------- */
export interface OrderCreate {
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  shipping_phone: string;
  buy_now_product_id?: number;
  buy_now_quantity?: number;
}

export interface OrderItem {
  id: number;
  product_id: number | null;
  product_name: string;
  product_image: string | null;
  quantity: number;
  price_at_purchase: number;
}

export interface OrderResponse {
  id: number;
  order_number: string;
  total_amount: number;
  status: string;
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  shipping_phone: string;
  created_at: string;
  items: OrderItem[];
}

/* ---------- Auth ---------- */
export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

/* ---------- Wishlist ---------- */
export interface WishlistItem {
  id: number;
  product_id: number;
  product_name: string | null;
  product_image: string | null;
  product_price: number | null;
  product_original_price: number | null;
  product_discount_percent: number | null;
  product_brand: string | null;
  product_rating: number | null;
  product_stock: number | null;
  created_at: string;
}

/* ---------- Address ---------- */
export interface Address {
  id: number;
  name: string;
  phone: string;
  address_line: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
  created_at: string;
}

export interface AddressCreate {
  name: string;
  phone: string;
  address_line: string;
  city: string;
  state: string;
  pincode: string;
  is_default?: boolean;
}
