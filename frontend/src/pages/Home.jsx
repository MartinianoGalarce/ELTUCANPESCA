// ─── Dependencias ──────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/layout/Layout';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products?limit=8'),
        ]);
        setCategories(catRes.data);
        setFeatured(prodRes.data.products);
      } catch (error) {
        console.error('Error cargando home:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <Layout>
      {/* ─── Hero ─────────────────────────────────────────────────────── */}
      <section className="bg-dark text-white rounded-2xl px-8 py-16 mb-12 text-center">
        <h1 className="text-4xl font-bold text-primary-light mb-4">
          Todo para tu aventura
        </h1>
        <p className="text-gray-300 text-lg mb-8">
          Equipamiento de pesca y camping de calidad al mejor precio
        </p>
        <Link
          to="/productos"
          className="bg-accent hover:bg-accent-dark text-white font-bold px-8 py-3 rounded-lg text-lg transition-colors"
        >
          Ver productos
        </Link>
      </section>

      {/* ─── Categorías ───────────────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-dark mb-6">Categorías</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                to={`/productos?category=${cat._id}`}
                className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:border-primary hover:shadow-md transition-all"
              >
                <div className="text-primary font-semibold">{cat.name}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ─── Productos destacados ─────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-dark">Productos destacados</h2>
          <Link to="/productos" className="text-primary hover:text-primary-dark font-medium text-sm">
            Ver todos →
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Cargando productos...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featured.map((product) => (
              <Link
                key={product._id}
                to={`/productos/${product.slug}`}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all"
              >
                {/* ─── Imagen ─────────────────────────────────────── */}
                <div className="bg-gray-100 h-44 flex items-center justify-center">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 text-sm">Sin imagen</span>
                  )}
                </div>
                {/* ─── Info ───────────────────────────────────────── */}
                <div className="p-4">
                  <div className="text-sm font-medium text-dark mb-1 line-clamp-2">
                    {product.name}
                  </div>
                  <div className="text-accent font-bold text-lg">
                    ${product.price.toLocaleString('es-AR')}
                  </div>
                  {product.stock === 0 && (
                    <div className="text-xs text-red-500 mt-1">Sin stock</div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Home;