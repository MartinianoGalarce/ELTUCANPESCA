// ─── Dependencias ──────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/layout/Layout';

const Catalog = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();

  // NOTE: leer filtros desde la URL para que sean compartibles
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const page = Number(searchParams.get('page')) || 1;

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page, limit: 12 });
        if (category) params.append('category', category);
        if (search) params.append('search', search);

        const [prodRes, catRes] = await Promise.all([
          api.get(`/products?${params}`),
          api.get('/categories'),
        ]);

        setProducts(prodRes.data.products);
        setTotal(prodRes.data.total);
        setPages(prodRes.data.pages);
        setCategories(catRes.data);
      } catch (error) {
        console.error('Error cargando catálogo:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category, search, page]);

  const handleCategory = (id) => {
    setSearchParams(id ? { category: id } : {});
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const value = e.target.search.value.trim();
    setSearchParams(value ? { search: value } : {});
  };

  const handlePage = (p) => {
    const params = {};
    if (category) params.category = category;
    if (search) params.search = search;
    params.page = p;
    setSearchParams(params);
  };

  return (
    <Layout>
      <div className="flex gap-8">

        {/* ─── Sidebar filtros ────────────────────────────────────────── */}
        <aside className="w-56 flex-shrink-0">
          <div className="bg-white border border-gray-200 rounded-xl p-4 sticky top-4">
            <h3 className="font-bold text-dark mb-4">Categorías</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleCategory('')}
                  className={`text-sm w-full text-left px-2 py-1 rounded transition-colors ${!category ? 'text-primary font-semibold' : 'text-gray-600 hover:text-primary'}`}
                >
                  Todos los productos
                </button>
              </li>
              {categories.map((cat) => (
                <li key={cat._id}>
                  <button
                    onClick={() => handleCategory(cat._id)}
                    className={`text-sm w-full text-left px-2 py-1 rounded transition-colors ${category === cat._id ? 'text-primary font-semibold' : 'text-gray-600 hover:text-primary'}`}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* ─── Contenido principal ────────────────────────────────────── */}
        <div className="flex-1">

          {/* ─── Buscador ─────────────────────────────────────────────── */}
          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <input
              name="search"
              defaultValue={search}
              placeholder="Buscar productos..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary"
            />
            <button
              type="submit"
              className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Buscar
            </button>
          </form>

          {/* ─── Cantidad de resultados ───────────────────────────────── */}
          <div className="text-sm text-gray-500 mb-4">
            {total} producto{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
          </div>

          {/* ─── Grilla de productos ──────────────────────────────────── */}
          {loading ? (
            <div className="text-center py-12 text-gray-400">Cargando productos...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No se encontraron productos.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {products.map((product) => (
                <Link
                  key={product._id}
                  to={`/productos/${product.slug}`}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all"
                >
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

          {/* ─── Paginación ───────────────────────────────────────────── */}
          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePage(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-primary text-white' : 'bg-white border border-gray-300 text-gray-600 hover:border-primary'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Catalog;