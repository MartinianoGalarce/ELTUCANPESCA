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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    setSidebarOpen(false);
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


  // NOTE: contenido del sidebar — reutilizado en desktop y en el drawer mobile
  const SidebarContent = () => (
    <>
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Categorias
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

      <button
        onClick={handleApplyFilters}
        className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-2 rounded-lg text-sm transition-colors"
      >
        Aplicar Filtros
      </button>
    </>
  );

  return (
    <Layout>

      {/* ─── Drawer mobile (overlay) ──────────────────────────────────── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-72 bg-white p-6 overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <span className="font-bold text-dark">Filtros</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-gray-400 hover:text-dark text-xl"
              >
                ✕
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}

      <div className="flex gap-8 items-start">

        {/* ─── Sidebar desktop ──────────────────────────────────────────── */}
        <aside className="hidden md:block w-52 flex-shrink-0 sticky top-4">
          <SidebarContent />
        </aside>

        {/* ─── Contenido principal ────────────────────────────────────── */}
        <div className="flex-1 min-w-0">

          {/* ─── Header resultados + ordenar ──────────────────────────── */}
          <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {/* Botón filtros — solo mobile */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden flex items-center gap-1.5 border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:border-primary transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                </svg>
                Filtros
              </button>
              <div className="text-sm text-gray-600 hidden sm:block">
                Mostrando <span className="font-bold text-dark">{products.length}</span> de {total}
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="hidden sm:inline">Ordenar por:</span>
              <select
                value={sort}
                onChange={(e) => handleSort(e.target.value)}
                className="font-semibold text-dark bg-transparent focus:outline-none cursor-pointer border border-gray-200 rounded-lg px-2 py-1 text-sm"
              >
                <option value="newest">Lo mas nuevo</option>
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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all group"
                >
                  <div className="relative h-36 sm:h-44 md:h-48 bg-gray-100">
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

                  <div className="p-3 md:p-4">
                    <div className="text-xs md:text-sm font-medium text-dark mb-2 line-clamp-2 min-h-[2.5rem]">
                      {product.name}
                    </div>
                    <div className="mb-3">
                      <div className="text-accent font-bold text-base md:text-lg leading-tight">
                        ${product.price.toLocaleString('es-AR')}
                      </div>
                      {product.stock > 0 ? (
                        <div className="flex items-center gap-1 mt-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
                          <span className="text-xs text-gray-400">{product.stock} disponibles</span>
                        </div>
                      ) : null}
                    </div>
                    <Link
                      to={`/productos/${product.slug}`}
                      className="block w-full text-center border border-dark text-dark hover:bg-dark hover:text-white text-xs md:text-sm font-medium py-1.5 md:py-2 rounded-lg transition-colors"
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