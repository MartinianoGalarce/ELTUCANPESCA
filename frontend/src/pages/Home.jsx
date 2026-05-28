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

  const transferPrice = (price) => Math.round(price * 0.9);

  return (
    <Layout>

      {/* Hero */}
      <section className="relative text-white rounded-2xl py-20 mb-12 overflow-hidden" style={{ backgroundImage: "url('/hero.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
        {/* Overlay oscuro para que el texto se lea bien */}
        <div className="absolute inset-0 bg-black/50 rounded-2xl" />
        
        <div className="relative max-w-2xl px-8">
          <span className="inline-block bg-accent/20 text-accent text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
            Nueva temporada 2026
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Todo para tu<br />
            <span className="text-primary-light">aventura al aire libre</span>
          </h1>
          <p className="text-gray-200 text-lg mb-4 leading-relaxed">
            Equipamiento de pesca y camping de calidad. Envios a todo el pais.
          </p>
          <div className="flex items-center gap-2 text-gray-300 text-sm mb-8">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <a href="https://maps.app.goo.gl/cT6qEuyvkv8vNyT77" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              Tapalque, Provincia de Buenos Aires
            </a>
          </div>
          <div className="flex gap-4 flex-wrap">
            <Link
              to="/productos"
              className="bg-accent hover:bg-accent-dark text-white font-bold px-8 py-3 rounded-lg text-base transition-colors"
            >
              Ver catalogo
            </Link>
            
            <a href="https://maps.app.goo.gl/cT6qEuyvkv8vNyT77"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-white/30 hover:border-white text-white font-medium px-8 py-3 rounded-lg text-base transition-colors"
            >
              Como llegar
            </a>
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-start gap-4">
          <div className="text-primary flex-shrink-0 bg-primary/10 p-2 rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1 10a2 2 0 002 2h8a2 2 0 002-2L19 8" />
            </svg>
          </div>
          <div>
            <div className="font-semibold text-dark text-sm mb-1">Envios a todo el pais</div>
            <div className="text-gray-500 text-xs leading-relaxed">Despachamos por correo privado en 3 a 7 dias habiles</div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-start gap-4">
          <div className="text-primary flex-shrink-0 bg-primary/10 p-2 rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div>
            <div className="font-semibold text-dark text-sm mb-1">Asesoramiento personalizado</div>
            <div className="text-gray-500 text-xs leading-relaxed">Te ayudamos a elegir el equipo ideal para cada salida</div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-start gap-4">
          <div className="text-primary flex-shrink-0 bg-primary/10 p-2 rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <div className="font-semibold text-dark text-sm mb-1">Retiro en Tapalque</div>
            <div className="text-gray-500 text-xs leading-relaxed">
              <a href="https://maps.app.goo.gl/cT6qEuyvkv8vNyT77" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                Ver ubicacion en Maps
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Categorias */}
      {categories.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-dark">Explora por categoria</h2>
            <Link to="/productos" className="text-sm text-primary hover:text-primary-dark transition-colors">
              Ver todo
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                to={`/productos?category=${cat._id}`}
                className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:border-primary hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5l2 2h4a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h2z" />
                  </svg>
                </div>
                <div className="text-sm font-semibold text-dark group-hover:text-primary transition-colors">
                  {cat.name}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Productos destacados */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-dark">Productos destacados</h2>
          <Link to="/productos" className="text-sm text-primary hover:text-primary-dark transition-colors">
            Ver todos
          </Link>
        </div>
        {loading ? (
          <div className="text-center py-12 text-gray-400">Cargando productos...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featured.map((product) => (
              <div key={product._id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all group">
                <div className="relative h-44 bg-gray-100">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 text-sm">Sin imagen</div>
                  )}
                  {product.category?.name && (
                    <span className="absolute top-2 left-2 bg-primary text-white text-xs font-semibold px-2 py-0.5 rounded uppercase tracking-wide">
                      {product.category.name}
                    </span>
                  )}
                  {product.stock > 0 && product.stock <= 5 && (
                    <span className="absolute top-2 right-2 bg-accent text-white text-xs font-semibold px-2 py-0.5 rounded uppercase tracking-wide">
                      Low Stock
                    </span>
                  )}
                  {product.stock === 0 && (
                    <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded uppercase tracking-wide">
                      Sin Stock
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <div className="text-sm font-medium text-dark mb-2 line-clamp-2 min-h-[2.5rem]">
                    {product.name}
                  </div>
                  <div className="mb-3">
                    <div className="text-accent font-bold text-lg leading-tight">${product.price.toLocaleString('es-AR')}</div>
                  </div>
                  <Link
                    to={`/productos/${product.slug}`}
                    className="block w-full text-center border border-dark text-dark hover:bg-dark hover:text-white text-sm font-medium py-2 rounded-lg transition-colors"
                  >
                    Ver detalle
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Banner CTA */}
      <section className="bg-primary rounded-2xl px-8 py-12 text-center text-white mb-4">
        <h2 className="text-2xl font-bold mb-2">Necesitas asesoramiento?</h2>
        <p className="text-primary-light mb-6 text-sm">
          Seguinos en Instagram y consultanos por cualquier producto
        </p>
        <a
          href="https://instagram.com/_eltucanpesca"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-white text-primary font-bold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
        >
          @_eltucanpesca
        </a>
      </section>

    </Layout>
  );
};

// ─── Exportacion ───────────────────────────────────────────────────────────

export default Home;