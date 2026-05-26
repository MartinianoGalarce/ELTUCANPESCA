// ─── Dependencias ──────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/layout/Layout';
import ReactSlider from 'react-slider';

const Catalog = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();

  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const page = Number(searchParams.get('page')) || 1;
  const sort = searchParams.get('sort') || 'newest';

  const [selectedCategories, setSelectedCategories] = useState(
    category ? [category] : []
  );

  const [priceRange, setPriceRange] = useState([
    Number(searchParams.get('minPrice')) || 0,
    Number(searchParams.get('maxPrice')) || 10000000,
  ]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page, limit: 12, sort });
        if (selectedCategories.length === 1) params.append('category', selectedCategories[0]);
        if (search) params.append('search', search);
        if (searchParams.get('minPrice')) params.append('minPrice', searchParams.get('minPrice'));
        if (searchParams.get('maxPrice')) params.append('maxPrice', searchParams.get('maxPrice'));

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
  }, [selectedCategories, search, page, sort, searchParams.get('minPrice'), searchParams.get('maxPrice')]);

  const handleCategoryToggle = (id) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleApplyFilters = () => {
    const params = {};
    if (selectedCategories.length === 1) params.category = selectedCategories[0];
    if (search) params.search = search;
    if (sort !== 'newest') params.sort = sort;
    if (priceRange[0] > 0) params.minPrice = priceRange[0];
    if (priceRange[1] < 10000000) params.maxPrice = priceRange[1];
    setSearchParams(params);
  };

  const handleSort = (value) => {
    const params = {};
    if (category) params.category = category;
    if (search) params.search = search;
    if (searchParams.get('minPrice')) params.minPrice = searchParams.get('minPrice');
    if (searchParams.get('maxPrice')) params.maxPrice = searchParams.get('maxPrice');
    params.sort = value;
    setSearchParams(params);
  };

  const handlePage = (p) => {
    const params = {};
    if (category) params.category = category;
    if (search) params.search = search;
    if (sort !== 'newest') params.sort = sort;
    if (searchParams.get('minPrice')) params.minPrice = searchParams.get('minPrice');
    if (searchParams.get('maxPrice')) params.maxPrice = searchParams.get('maxPrice');
    params.page = p;
    setSearchParams(params);
  };

  const transferPrice = (price) => Math.round(price * 0.9);

  return (
    <Layout>
      <div className="flex gap-8 items-start">

        {/* ─── Sidebar filtros ────────────────────────────────────────── */}
        <aside className="w-52 flex-shrink-0 sticky top-4">

          {/* Categorías */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Categorías
            </h3>
            <div className="space-y-2">
              {categories.map((cat) => (
                <label key={cat._id} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat._id)}
                    onChange={() => handleCategoryToggle(cat._id)}
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="text-sm text-gray-600 group-hover:text-dark transition-colors">
                    {cat.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Rango de precio */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Rango de precio
            </h3>
            <ReactSlider
              className="w-full h-2 bg-gray-200 rounded-full my-4"
              thumbClassName="w-4 h-4 bg-primary rounded-full cursor-pointer focus:outline-none -top-1.5 border-2 border-white shadow"
              trackClassName="h-2 rounded-full"
              value={priceRange}
              min={0}
              max={500000}
              step={1000}
              onChange={(val) => setPriceRange(val)}
              pearling
              minDistance={10000}
              renderTrack={(props, state) => (
                <div
                  {...props}
                  className={`h-2 rounded-full ${state.index === 1 ? 'bg-primary' : 'bg-gray-200'}`}
                />
              )}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>${priceRange[0].toLocaleString('es-AR')}</span>
              <span>${priceRange[1].toLocaleString('es-AR')}</span>
            </div>
            {(searchParams.get('minPrice') || searchParams.get('maxPrice')) && (
              <button
                onClick={() => {
                  setPriceRange([0, 500000]);
                  const params = {};
                  if (category) params.category = category;
                  if (search) params.search = search;
                  if (sort !== 'newest') params.sort = sort;
                  setSearchParams(params);
                }}
                className="text-xs text-red-400 hover:text-red-600 mt-2 transition-colors"
              >
                Limpiar rango
              </button>
            )}
          </div>

          {/* Botón aplicar */}
          <button
            onClick={handleApplyFilters}
            className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-2 rounded-lg text-sm transition-colors"
          >
            Aplicar Filtros
          </button>

        </aside>

        {/* ─── Contenido principal ────────────────────────────────────── */}
        <div className="flex-1 min-w-0">

          {/* ─── Header resultados + ordenar ──────────────────────────── */}
          <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between mb-6">
            <div className="text-sm text-gray-600">
              Mostrando <span className="font-bold text-dark">{products.length} productos</span> de {total}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Ordenar por:</span>
              <select
                value={sort}
                onChange={(e) => handleSort(e.target.value)}
                className="font-semibold text-dark bg-transparent focus:outline-none cursor-pointer border border-gray-200 rounded-lg px-2 py-1 text-sm"
              >
                <option value="newest">Lo más nuevo</option>
                <option value="price_asc">Menor precio</option>
                <option value="price_desc">Mayor precio</option>
              </select>
            </div>
          </div>

          {/* ─── Grilla de productos ──────────────────────────────────── */}
          {loading ? (
            <div className="text-center py-12 text-gray-400">Cargando productos...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No se encontraron productos.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all group"
                >
                  <div className="relative h-48 bg-gray-100">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                        Sin imagen
                      </div>
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
                      <div className="text-gray-400 text-xs line-through">
                        ${product.price.toLocaleString('es-AR')}
                      </div>
                      <div className="text-accent font-bold text-lg leading-tight">
                        ${transferPrice(product.price).toLocaleString('es-AR')}
                      </div>
                      <div className="text-gray-400 text-xs">
                        Precio pagando con Transferencia
                      </div>
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

          {/* ─── Paginación ───────────────────────────────────────────── */}
          {pages > 1 && (
            <div className="flex justify-center items-center gap-1 mt-8">
              <button
                onClick={() => handlePage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="w-9 h-9 rounded-lg border border-gray-300 text-gray-600 hover:border-primary disabled:opacity-40 flex items-center justify-center"
              >
                ‹
              </button>
              {Array.from({ length: pages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === pages || Math.abs(p - page) <= 1)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  p === '...' ? (
                    <span key={idx} className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm">...</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => handlePage(p)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                        p === page ? 'bg-primary text-white' : 'bg-white border border-gray-300 text-gray-600 hover:border-primary'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              <button
                onClick={() => handlePage(Math.min(pages, page + 1))}
                disabled={page === pages}
                className="w-9 h-9 rounded-lg border border-gray-300 text-gray-600 hover:border-primary disabled:opacity-40 flex items-center justify-center"
              >
                ›
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Catalog;