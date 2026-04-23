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

  // NOTE: images es el array de URLs de Cloudinary ya guardadas (al editar)
// newFiles son los File objects elegidos pero aún no subidos
// previews son las URLs locales para mostrar antes de subir
const [images, setImages] = useState([]);
const [newFiles, setNewFiles] = useState([]);
const [previews, setPreviews] = useState([]);
const [imageLoading, setImageLoading] = useState(false);

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
          // NOTE: si el producto ya tiene imagen, la mostramos como imagen actual
          if (p.images && p.images[0]) {
            if (p.images && p.images.length > 0) {
              setImages(p.images);
}
          }
        })
        .catch(() => navigate('/admin/productos'));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleImageChange = (e) => {
  const files = Array.from(e.target.files);
  const total = images.length + newFiles.length + files.length;
  if (total > 5) {
    setError('Máximo 5 imágenes por producto');
    return;
  }
  setNewFiles((prev) => [...prev, ...files]);
  setPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
  // NOTE: reset del input para poder elegir el mismo archivo de nuevo si hace falta
  e.target.value = '';
};

  // NOTE: idx es el índice global — primero van las images guardadas, después los previews nuevos
const handleRemoveImage = (idx) => {
  if (idx < images.length) {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  } else {
    const newIdx = idx - images.length;
    setNewFiles((prev) => prev.filter((_, i) => i !== newIdx));
    setPreviews((prev) => prev.filter((_, i) => i !== newIdx));
  }
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
      let finalImages = [...images];

      if (newFiles.length > 0) {
        setImageLoading(true);
        const formData = new FormData();
        newFiles.forEach((file) => formData.append('images', file));
        const uploadRes = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        // NOTE: el backend devuelve array de { url, publicId }
        finalImages = [...finalImages, ...uploadRes.data.map((r) => r.url)];
        setImageLoading(false);
      }

      const payload = {
        ...form,
        price: Number(form.price),
        cost: Number(form.cost),
        stock: Number(form.stock),
        images: finalImages,
      };

      if (isEditing) {
        await api.patch(`/products/${id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      navigate('/admin/productos');
    } catch (err) {
      setImageLoading(false);
      setError(err.response?.data?.error || 'Error al guardar producto');
    } finally {
      setLoading(false);
    }
  };

  // NOTE: imagen que se muestra — primero el preview local, si no la imagen actual de Cloudinary

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

          {/* ─── Imágenes del producto ─────────────────────────────────────── */}
          <div>
            <label className="block text-sm font-medium text-dark mb-1">
              Imágenes del producto
              <span className="text-gray-400 font-normal ml-1">
                ({images.length + newFiles.length}/5)
              </span>
            </label>

            <div className="flex flex-wrap gap-3">
              {/* Imágenes ya guardadas en Cloudinary */}
              {images.map((url, idx) => (
                <div key={idx} className="relative w-24 h-24">
                  <img src={url} alt="" className="w-24 h-24 object-cover rounded-xl border border-gray-200" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold transition-colors"
                  >✕</button>
                </div>
              ))}

              {/* Previews de imágenes nuevas aún no subidas */}
              {previews.map((url, idx) => (
                <div key={idx} className="relative w-24 h-24">
                  <img src={url} alt="" className="w-24 h-24 object-cover rounded-xl border border-primary border-dashed" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(images.length + idx)}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold transition-colors"
                  >✕</button>
                </div>
              ))}

              {/* Botón agregar — solo si no llegamos a 5 */}
              {images.length + newFiles.length < 5 && (
                <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary transition-colors bg-gray-50">
                  <span className="text-2xl">📷</span>
                  <span className="text-xs text-gray-500 mt-1">Agregar</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG o WEBP — máximo 5MB por imagen</p>
          </div>

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
              disabled={loading || imageLoading}
              className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60"
            >
              {imageLoading ? 'Subiendo imagen...' : loading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear producto'}
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