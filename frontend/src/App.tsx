import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import Navbar from './components/Navbar/Navbar';
import AuthModal from './components/AuthModal/AuthModal';
import Footer from './components/Footer/Footer';
import HomePage from './pages/HomePage/HomePage';
import ProductDetailPage from './pages/ProductDetailPage/ProductDetailPage';
import CartPage from './pages/CartPage/CartPage';
import CheckoutPage from './pages/CheckoutPage/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage/OrderConfirmationPage';
import OrderHistoryPage from './pages/OrderHistoryPage/OrderHistoryPage';
import WishlistPage from './pages/WishlistPage/WishlistPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
          <Navbar />
          <AuthModal />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orders" element={<OrderHistoryPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route
              path="/order-confirmation/:orderNumber"
              element={<OrderConfirmationPage />}
            />
          </Routes>
          <Footer />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
