// ─── Dependencias ──────────────────────────────────────────────────────────
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';

const NotFound = () => {
  return (
    <Layout>
      <div className="text-center py-24">
        <div className="text-8xl font-bold text-gray-100 mb-4">404</div>
        <div className="text-6xl mb-6">🎣</div>
        <h1 className="text-2xl font-bold text-dark mb-3">Página no encontrada</h1>
        <p className="text-gray-500 mb-8 max-w-sm mx-auto">
          Parece que este anzuelo no enganchó nada. La página que buscás no existe o fue movida.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            to="/"
            className="bg-primary hover:bg-primary-dark text-white font-bold px-6 py-3 rounded-xl transition-colors"
          >
            Volver al inicio
          </Link>
          <Link
            to="/productos"
            className="border border-gray-300 text-gray-600 hover:border-primary hover:text-primary font-medium px-6 py-3 rounded-xl transition-colors"
          >
            Ver productos
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;