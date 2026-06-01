// ─── Dependencias ──────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import api from '../../services/api';
import AdminLayout from '../../components/layout/AdminLayout';

const AdminBanner = () => {
  const [messages, setMessages] = useState(['']);
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'ok' | 'error', text }

  useEffect(() => {
    api.get('/settings/banner')
      .then(res => {
        setMessages(res.data.messages?.length > 0 ? res.data.messages : ['']);
        setActive(res.data.active);
      })
      .catch(() => setFeedback({ type: 'error', text: 'Error al cargar el banner' }))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (index, value) => {
    const updated = [...messages];
    updated[index] = value;
    setMessages(updated);
  };

  const handleAdd = () => {
    if (messages.length >= 5) return;
    setMessages([...messages, '']);
  };

  const handleRemove = (index) => {
    if (messages.length === 1) return;
    setMessages(messages.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const clean = messages.map(m => m.trim()).filter(m => m.length > 0);
    if (clean.length === 0) {
      setFeedback({ type: 'error', text: 'Agregá al menos un mensaje' });
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      await api.put('/settings/banner', { messages: clean, active });
      setMessages(clean);
      setFeedback({ type: 'ok', text: 'Banner actualizado correctamente' });
    } catch {
      setFeedback({ type: 'error', text: 'Error al guardar el banner' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-20 text-gray-400">Cargando...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark">Banner promocional</h1>
        <p className="text-gray-500 text-sm mt-1">
          Editá los mensajes que rotan en la barra naranja del sitio. Máximo 5.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-xl">

        {/* ─── Feedback ─────────────────────────────────────────────── */}
        {feedback && (
          <div className={`text-sm rounded-lg px-4 py-3 mb-6 ${
            feedback.type === 'ok'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-600'
          }`}>
            {feedback.text}
          </div>
        )}

        {/* ─── Toggle activo ────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100">
          <div>
            <div className="text-sm font-medium text-dark">Mostrar banner</div>
            <div className="text-xs text-gray-400 mt-0.5">Activá o desactivá la barra sin borrar los mensajes</div>
          </div>
          <button
            onClick={() => setActive(!active)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              active ? 'bg-primary' : 'bg-gray-300'
            }`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
              active ? 'left-6' : 'left-1'
            }`} />
          </button>
        </div>

        {/* ─── Mensajes ─────────────────────────────────────────────── */}
        <div className="space-y-3 mb-6">
          {messages.map((msg, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-4">{i + 1}.</span>
              <input
                type="text"
                value={msg}
                onChange={(e) => handleChange(i, e.target.value)}
                maxLength={80}
                placeholder={`Mensaje ${i + 1}...`}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
              />
              <button
                onClick={() => handleRemove(i)}
                disabled={messages.length === 1}
                className="text-gray-300 hover:text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-lg leading-none"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* ─── Agregar mensaje ──────────────────────────────────────── */}
        {messages.length < 5 && (
          <button
            onClick={handleAdd}
            className="text-sm text-primary hover:text-primary-dark font-medium transition-colors mb-6 flex items-center gap-1"
          >
            <span className="text-lg leading-none">+</span> Agregar mensaje
          </button>
        )}

        {/* ─── Guardar ──────────────────────────────────────────────── */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60"
        >
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </AdminLayout>
  );
};

export default AdminBanner;