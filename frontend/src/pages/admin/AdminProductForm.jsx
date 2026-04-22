// ─── Dependencias ──────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import AdminLayout from '../../components/layout/AdminLayout';

const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // NOTE: estado para el modal de nueva categoría inline
  const [showCatModal, setShowCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [catLoading, setCatLoading] = useState(false);
  const [catError, setCatError] = useState('');

  const [form, setForm] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    cost: '',
    stock: '',
    active: true,
  });

  const fetchCategories = async () => {
    const res = await api.get('/categories');
    setCategories(res.data);
  };

  useEffect(() => {
    fetchCategories();
    if (isEditing) {
      api.get(`/products/admin/${id}`)
        .then((res) => {
          const p = res.data;
          setForm({
            name: p.name,
            category: p.category?._id || '',
            description: p.description,
            price: p.price,
            cost: p.cost || '',
            stock: p.stock,
            active: p.active,
          });
        })
        .catch(() => navigate('/admin/productos'));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  // NOTE: crear categoría sin salir del formulario de producto
  const handleCreateCategory = async () => {
  if (!newCatName.trim()) {
    setCatError('El nombre es obligatorio');
    return;
  }
  setCatError('');
  setCatLoading(true);
    try {
      const res = await api.post('/categories', { name: newCatName, description: newCatDesc });
      await fetchCategories();
      // NOTE: seleccionar automáticamente la categoría recién creada
      setForm((prev) => ({ ...prev, category: res.data._id }));
      setShowCatModal(false);
      setNewCatName('');
      setNewCatDesc('');
    } catch (err) {
      setCatError(err.response?.data?.error || 'Error al crear categoría');
    } finally {
      setCatLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        cost: Number(form.cost),
        stock: Number(form.stock),
      };
      if (isEditing) {
        await api.patch(`/products/${id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      navigate('/admin/productos');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/admin/productos')}
            className="text-gray-400 hover:text-dark transition-colors"
          >
            ← Volver
          </button>
          <h1 className="text-2xl font-bold text-dark">
            {isEditing ? 'Editar producto' : 'Nuevo producto'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-dark mb-1">Nombre</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary"
              placeholder="Caña Shimano FX 2.40m"
            />
          </div>

          {/* ─── Categoría + botón nueva categoría ─────────────────────── */}
          <div>
            <label className="block text-sm font-medium text-dark mb-1">Categoría</label>
            <div className="flex gap-2">
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary"
              >
                <option value="">Seleccioná una categoría</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowCatModal(true)}
                className="px-3 py-2 border border-primary text-primary hover:bg-primary hover:text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
              >
                + Nueva
              </button>
            </div>

            {/* ─── Modal inline nueva categoría ───────────────────────── */}
            {showCatModal && (
              <div className="mt-3 bg-green-50 border border-primary rounded-xl p-4">
                <div className="font-medium text-dark text-sm mb-3">Nueva categoría</div>
                {catError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg px-3 py-2 mb-3">
                    {catError}
                  </div>
                )}
                <div className="space-y-3">
                  <input
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    required
                    placeholder="Nombre de la categoría"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  />
                  <input
                    value={newCatDesc}
                    onChange={(e) => setNewCatDesc(e.target.value)}
                    placeholder="Descripción (opcional)"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  />
                  <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={handleCreateCategory}
                        disabled={catLoading}
                        className="bg-primary hover:bg-primary-dark text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-60"
                        >
                        {catLoading ? 'Creando...' : 'Crear y seleccionar'}
                        </button>
                    <button
                      type="button"
                      onClick={() => { setShowCatModal(false); setCatError(''); }}
                      className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm hover:border-gray-400 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-1">Descripción</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary resize-none"
              placeholder="Descripción del producto..."
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-1">Precio de venta</label>
              <input
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                required
                min="0"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary"
                placeholder="25000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1">Costo</label>
              <input
                name="cost"
                type="number"
                value={form.cost}
                onChange={handleChange}
                min="0"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary"
                placeholder="15000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1">Stock</label>
              <input
                name="stock"
                type="number"
                value={form.stock}
                onChange={handleChange}
                required
                min="0"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary"
                placeholder="10"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="active"
              id="active"
              checked={form.active}
              onChange={handleChange}
              className="w-4 h-4 accent-primary"
            />
            <label htmlFor="active" className="text-sm font-medium text-dark">
              Producto activo (visible en la tienda)
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60"
            >
              {loading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear producto'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/productos')}
              className="px-6 border border-gray-300 text-gray-600 hover:border-gray-400 rounded-xl transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminProductForm;