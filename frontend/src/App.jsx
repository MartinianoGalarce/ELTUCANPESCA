// ─── Dependencias ──────────────────────────────────────────────────────────
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/productos" element={<Catalog />} />
      <Route path="/productos/:slug" element={<ProductDetail />} />
    </Routes>
  );
}

export default App;