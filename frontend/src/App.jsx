// ─── Dependencias ──────────────────────────────────────────────────────────
import { Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/layout/PrivateRoute';

// Páginas públicas
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import OrderConfirmed from './pages/OrderConfirmed';

// Páginas de usuario
import MyOrders from './pages/MyOrders';
import MyAccount from './pages/MyAccount';

// Páginas admin
import Dashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders from './pages/admin/AdminOrders';
import AdminSalePresencial from './pages/admin/AdminSalePresencial';

function App() {
  return (
    <Routes>
      {/* ── Públicas ───────────────────────────────────────────────────── */}
      <Route path="/" element={<Home />} />
      <Route path="/productos" element={<Catalog />} />
      <Route path="/productos/:slug" element={<ProductDetail />} />
      <Route path="/carrito" element={<Cart />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Register />} />

      {/* ── Privadas (usuario logueado) ─────────────────────────────────── */}
      <Route path="/checkout" element={
        <PrivateRoute><Checkout /></PrivateRoute>
      } />
      <Route path="/orden-confirmada/:id" element={
        <PrivateRoute><OrderConfirmed /></PrivateRoute>
      } />
      <Route path="/mis-pedidos" element={
        <PrivateRoute><MyOrders /></PrivateRoute>
      } />
      <Route path="/mi-cuenta" element={
        <PrivateRoute><MyAccount /></PrivateRoute>
      } />

      {/* ── Admin ──────────────────────────────────────────────────────── */}
      <Route path="/admin" element={
        <PrivateRoute adminOnly><Dashboard /></PrivateRoute>
      } />
      <Route path="/admin/productos" element={
        <PrivateRoute adminOnly><AdminProducts /></PrivateRoute>
      } />
      <Route path="/admin/productos/nuevo" element={
        <PrivateRoute adminOnly><AdminProductForm /></PrivateRoute>
      } />
      <Route path="/admin/productos/:id" element={
        <PrivateRoute adminOnly><AdminProductForm /></PrivateRoute>
      } />
      <Route path="/admin/categorias" element={
        <PrivateRoute adminOnly><AdminCategories /></PrivateRoute>
      } />
      <Route path="/admin/ordenes" element={
        <PrivateRoute adminOnly><AdminOrders /></PrivateRoute>
      } />
      <Route path="/admin/venta-presencial" element={
        <PrivateRoute adminOnly><AdminSalePresencial /></PrivateRoute>
      } />
    </Routes>
  );
}

export default App;