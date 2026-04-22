// ─── Dependencias ──────────────────────────────────────────────────────────
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import OrderConfirmed from './pages/OrderConfirmed';
import MyOrders from './pages/MyOrders';
import MyAccount from './pages/MyAccount';
import Dashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders from './pages/admin/AdminOrders';
import AdminSalePresencial from './pages/admin/AdminSalePresencial';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/productos" element={<Catalog />} />
      <Route path="/productos/:slug" element={<ProductDetail />} />
      <Route path="/carrito" element={<Cart />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Register />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/orden-confirmada/:id" element={<OrderConfirmed />} />
      <Route path="/mis-pedidos" element={<MyOrders />} />
      <Route path="/mi-cuenta" element={<MyAccount />} />
      <Route path="/admin" element={<Dashboard />} />
      <Route path="/admin/productos" element={<AdminProducts />} />
      <Route path="/admin/productos/nuevo" element={<AdminProductForm />} />
      <Route path="/admin/productos/:id" element={<AdminProductForm />} />
      <Route path="/admin/categorias" element={<AdminCategories />} />
      <Route path="/admin/ordenes" element={<AdminOrders />} />
      <Route path="/admin/venta-presencial" element={<AdminSalePresencial />} />
    </Routes>
  );
}

export default App;