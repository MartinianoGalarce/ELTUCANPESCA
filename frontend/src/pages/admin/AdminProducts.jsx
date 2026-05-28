// ─── Dependencias ──────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import AdminLayout from '../../components/layout/AdminLayout';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: 100 });
      if (filterCategory) params.append('category', filterCategory);
      if (search) params.append('search', search);
      const res = await api.get(`/products?${params}`);
      setProducts(res.data.products);
    } catch (error) {
      console.error('Error cargando productos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data));
    fetchProducts();
  }, [filterCategory]);

  const handleToggleActive = async (product) => {
    try {
      await api.patch(`/products/${product._id}`, { active: !product.active });
      setProducts((prev) =>
        prev.map((p) => p._id === product._id ? { ...p, active: !p.active } : p)
      );
    } catch (error) {
      console.error('Error actualizando producto:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Seguro que queres eliminar este producto?')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (error) {
      console.error('Error eliminando producto:', error);
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-dark">Productos</h1>
        <Link
          to="/admin/productos/nuevo"
          className="bg-primary hover:bg-primary-dark text-white font-bold px-3 md:px-4 py-2 rounded-xl text-sm transition-colors whitespace-nowrap"
        >
          + Nuevo
        </Link>
      </div>

      {/* ─── Filtros ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchProducts()}
          placeholder="Buscar producto..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary"
        />
        <div className="flex gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="flex-1 sm:flex-none border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
          >
            <option value="">Todas</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
          <button
            onClick={fetchProducts}
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm transition-colors whitespace-nowrap"
          >
            Buscar
          </button>
        </div>
      </div>

      {/* ─── Tabla desktop ────────────────────────────────────────────────── */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Cargando productos...</div>
      ) : (
        <>
          {/* Tabla — visible en md+ */}
          <div className="hidden md:block bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Producto</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Categoria</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">Precio</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">Costo</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">Stock</th>
                  <th className="text-center px-4 py-3 text-gray-500 font-medium">Estado</th>
                  <th className="text-center px-4 py-3 text-gray-500 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, i) => (
                  <tr key={product._id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-dark">{product.name}</div>
                      {(!product.images || product.images.length === 0) && (
                        <div className="text-xs text-blue-500">Sin imagen</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{product.category?.name || '—'}</td>
                    <td className="px-4 py-3 text-right font-medium text-dark">
                      ${product.price.toLocaleString('es-AR')}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-dark">
                      ${product.cost?.toLocaleString('es-AR') || '—'}
                    </td>
                    <td className={`px-4 py-3 text-right font-medium ${product.stock <= 5 ? 'text-red-500' : 'text-dark'}`}>
                      {product.stock}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleToggleActive(product)}
                        className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                          product.active
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {product.active ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          to={`/admin/productos/${product._id}`}
                          className="text-primary hover:text-primary-dark text-xs font-medium"
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="text-red-500 hover:text-red-700 text-xs font-medium"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {products.length === 0 && (
              <div className="text-center py-12 text-gray-400">No se encontraron productos</div>
            )}
          </div>

          {/* Cards mobile — visible en menos de md */}
          <div className="md:hidden space-y-3">
            {products.length === 0 ? (
              <div className="text-center py-12 text-gray-400">No se encontraron productos</div>
            ) : (
              products.map((product) => (
                <div key={product._id} className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0">
                      <div className="font-medium text-dark text-sm leading-tight mb-1 line-clamp-2">
                        {product.name}
                      </div>
                      <div className="text-xs text-gray-400">{product.category?.name || '—'}</div>
                      {(!product.images || product.images.length === 0) && (
                        <div className="text-xs text-blue-500 mt-0.5">Sin imagen</div>
                      )}
                    </div>
                    <button
                      onClick={() => handleToggleActive(product)}
                      className={`text-xs px-2 py-1 rounded-full font-medium transition-colors flex-shrink-0 ${
                        product.active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {product.active ? 'Activo' : 'Inactivo'}
                    </button>
                  </div>

                  <div className="flex items-center gap-4 mb-3 text-sm">
                    <div>
                      <div className="text-xs text-gray-400">Precio</div>
                      <div className="font-bold text-dark">${product.price.toLocaleString('es-AR')}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Costo</div>
                      <div className="font-medium text-dark">${product.cost?.toLocaleString('es-AR') || '—'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Stock</div>
                      <div className={`font-medium ${product.stock <= 5 ? 'text-red-500' : 'text-dark'}`}>
                        {product.stock}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 border-t border-gray-100 pt-3">
                    <Link
                      to={`/admin/productos/${product._id}`}
                      className="flex-1 text-center text-primary hover:text-primary-dark text-sm font-medium py-1"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="flex-1 text-center text-red-500 hover:text-red-700 text-sm font-medium py-1"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </AdminLayout>
  );
};

export default AdminProducts;