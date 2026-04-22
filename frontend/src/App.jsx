// ─── Dependencias ──────────────────────────────────────────────────────────
import { Routes, Route } from 'react-router-dom';

// ─── Páginas (se van agregando a medida que se crean) ──────────────────────
// import Home from './pages/Home';

function App() {
  return (
    <Routes>
      <Route path="/" element={<div className="p-8 text-2xl font-bold text-green-700">El Tucan Pesca — Frontend funcionando</div>} />
    </Routes>
  );
}

export default App;