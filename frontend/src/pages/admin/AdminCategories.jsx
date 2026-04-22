// ─── Dependencias ──────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import api from '../../services/api';
import AdminLayout from '../../components/layout/AdminLayout';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const [form, setForm] = useState({ name: '', description: '' });

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (error) {
      console.error('Error cargando categorías:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleEdit = (cat) => {
    setEditing(cat);
    setForm({ name: cat.name, description: cat.description });
    setShowForm(true);
  };

  const handleNew = () => {
    setEditing(null);
    setForm({ name: '', description: '' });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
        await api.patch(`/categories/${editing._id}`, form);
      } else {
        await api.post('/categories', form);
      }
      setShowForm(false);
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar categoría');
    }
  };

  const handleToggleActive = async (cat) => {
    try {
      await api.patch(`/categories/${cat._id}`, { active: !cat.active });
      setCategories((prev) =>
        prev.map((c) => c._id === cat._id ? { ...c, active: !c.active } : c)
      );
    } catch (error) {
      console.error('Error actualizando categoría:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Seguro que querés eliminar esta categoría?')) return;
    try {
      await api.delete(`/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c._id !== id));
    } catch (error) {
      console.error('Error eliminando categoría:', error);
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-dark">Categorías</h1>
        <button
          onClick={handleNew}
          className="bg-primary hover:bg-primary-dark text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors"
        >
          + Nueva categoría
        </button>
      </div>

      {/* ─── Formulario inline ────────────────────────────────────────────── */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
          <h2 className="font-bold text-dark mb-4">
            {editing ? 'Editar categoría' : 'Nueva categoría'}
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-1">Nombre</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary"
                placeholder="Cañas de Pesca"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1">Descripción</label>
              <input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary"
                placeholder="Descripción opcional"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-primary hover:bg-primary-dark text-white font-bold px-6 py-2 rounded-xl text-sm transition-colors"
              >
                {editing ? 'Guardar cambios' : 'Crear categoría'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="border border-gray-300 text-gray-600 px-6 py-2 rounded-xl text-sm hover:border-gray-400 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── Tabla ────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Cargando categorías...</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Nombre</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Slug</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Descripción</th>
                <th className="text-center px-4 py-3 text-gray-500 font-medium">Estado</th>
                <th className="text-center px-4 py-3 text-gray-500 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, i) => (
                <tr key={cat._id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 font-medium text-dark">{cat.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{cat.slug}</td>
                  <td className="px-4 py-3 text-gray-500">{cat.description || '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleToggleActive(cat)}
                      className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                        cat.active
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {cat.active ? 'Activa' : 'Inactiva'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => handleEdit(cat)}
                        className="text-primary hover:text-primary-dark text-xs font-medium"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(cat._id)}
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
          {categories.length === 0 && (
            <div className="text-center py-12 text-gray-400">No hay categorías todavía</div>
          )}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCategories;