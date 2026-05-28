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
      console.error('Error cargando categorias:', error);
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
      setError(err.response?.data?.error || 'Error al guardar categoria');
    }
  };

  const handleToggleActive = async (cat) => {
    try {
      await api.patch(`/categories/${cat._id}`, { active: !cat.active });
      setCategories((prev) =>
        prev.map((c) => c._id === cat._id ? { ...c, active: !c.active } : c)
      );
    } catch (error) {
      console.error('Error actualizando categoria:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Seguro que queres eliminar esta categoria?')) return;
    try {
      await api.delete(`/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c._id !== id));
    } catch (error) {
      console.error('Error eliminando categoria:', error);
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-dark">Categorias</h1>
        <button
          onClick={handleNew}
          className="bg-primary hover:bg-primary-dark text-white font-bold px-3 md:px-4 py-2 rounded-xl text-sm transition-colors whitespace-nowrap"
        >
          + Nueva
        </button>
      </div>

      {/* ─── Formulario inline ────────────────────────────────────────────── */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-6 mb-6">
          <h2 className="font-bold text-dark mb-4">
            {editing ? 'Editar categoria' : 'Nueva categoria'}
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
                placeholder="Canas de Pesca"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1">Descripcion</label>
              <input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary"
                placeholder="Descripcion opcional"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-primary hover:bg-primary-dark text-white font-bold px-6 py-2 rounded-xl text-sm transition-colors"
              >
                {editing ? 'Guardar cambios' : 'Crear categoria'}
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

      {/* ─── Tabla desktop ────────────────────────────────────────────────── */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Cargando categorias...</div>
      ) : (
        <>
          {/* Tabla — visible en md+ */}
          <div className="hidden md:block bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Nombre</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Slug</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Descripcion</th>
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
              <div className="text-center py-12 text-gray-400">No hay categorias todavia</div>
            )}
          </div>

          {/* Cards mobile — visible en menos de md */}
          <div className="md:hidden space-y-3">
            {categories.length === 0 ? (
              <div className="text-center py-12 text-gray-400">No hay categorias todavia</div>
            ) : (
              categories.map((cat) => (
                <div key={cat._id} className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <div className="font-medium text-dark text-sm">{cat.name}</div>
                      <div className="font-mono text-xs text-gray-400 mt-0.5">{cat.slug}</div>
                      {cat.description && (
                        <div className="text-xs text-gray-500 mt-1">{cat.description}</div>
                      )}
                    </div>
                    <button
                      onClick={() => handleToggleActive(cat)}
                      className={`text-xs px-2 py-1 rounded-full font-medium transition-colors flex-shrink-0 ${
                        cat.active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {cat.active ? 'Activa' : 'Inactiva'}
                    </button>
                  </div>
                  <div className="flex gap-3 border-t border-gray-100 pt-3 mt-3">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="flex-1 text-center text-primary hover:text-primary-dark text-sm font-medium py-1"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(cat._id)}
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

export default AdminCategories;