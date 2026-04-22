// ─── Dependencias ──────────────────────────────────────────────────────────
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/productos" element={<Catalog />} />
      <Route path="/productos/:slug" element={<ProductDetail />} />
      <Route path="/carrito" element={<Cart />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Register />} />
      {/* NOTE: ruta temporal hasta que se construya el dashboard admin */}
      <Route path="/admin" element={<Home />} />
    </Routes>
  );
}

export default App;