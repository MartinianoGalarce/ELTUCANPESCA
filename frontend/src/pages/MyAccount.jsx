// ─── Dependencias ──────────────────────────────────────────────────────────
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Layout from '../components/layout/Layout';

// ─── Componente cambio de contraseña ───────────────────────────────────────
const ChangePasswordForm = () => {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (form.newPassword !== form.confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      await api.patch('/auth/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setSuccess(true);
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cambiar contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
          Contraseña actualizada correctamente
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-dark mb-1">Contraseña actual</label>
        <input
          type="password"
          name="currentPassword"
          value={form.currentPassword}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary"
          placeholder="••••••"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-dark mb-1">Nueva contraseña</label>
        <input
          type="password"
          name="newPassword"
          value={form.newPassword}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary"
          placeholder="Mínimo 6 caracteres"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-dark mb-1">Confirmar nueva contraseña</label>
        <input
          type="password"
          name="confirm"
          value={form.confirm}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary"
          placeholder="Repetí la contraseña"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60"
      >
        {loading ? 'Guardando...' : 'Cambiar contraseña'}
      </button>
    </form>
  );
};

// ─── Componente principal ──────────────────────────────────────────────────
const MyAccount = () => {
  const { user } = useAuth();

  const [address, setAddress] = useState({
    street:   user?.address?.street   || '',
    number:   user?.address?.number   || '',
    city:     user?.address?.city     || '',
    province: user?.address?.province || '',
    zip:      user?.address?.zip      || '',
    phone:    user?.address?.phone    || '',
  });

  const [name, setName] = useState(user?.name || '');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);
    try {
      await api.patch('/auth/me', { name, address });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-dark">Mi cuenta</h1>
          <Link
            to="/mis-pedidos"
            className="text-primary hover:text-primary-dark font-medium text-sm transition-colors"
          >
            Ver mis pedidos →
          </Link>
        </div>

        {/* ─── Info usuario ───────────────────────────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-dark text-lg">{user?.name}</div>
              <div className="text-gray-500 text-sm">{user?.email}</div>
              {user?.role === 'admin' && (
                <Link to="/admin" className="mt-1 inline-block">
                  <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full mt-1 inline-block">
                    Admin - Ir al dashboard
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ─── Datos personales ───────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
          <h2 className="font-bold text-dark text-lg mb-6">Datos personales</h2>

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-6">
              Perfil actualizado correctamente
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-6">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-dark mb-1">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <h3 className="font-medium text-dark mb-4">Dirección de entrega</h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-dark mb-1">Calle</label>
              <input name="street" value={address.street} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                placeholder="Av. Corrientes" />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1">Número</label>
              <input name="number" value={address.number} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                placeholder="1234" />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1">Ciudad</label>
              <input name="city" value={address.city} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                placeholder="Buenos Aires" />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1">Provincia</label>
              <input name="province" value={address.province} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                placeholder="CABA" />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1">Código postal</label>
              <input name="zip" value={address.zip} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                placeholder="1043" />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1">Teléfono</label>
              <input name="phone" value={address.phone} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                placeholder="1112345678" />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60">
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>

        {/* ─── Cambiar contraseña ─────────────────────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="font-bold text-dark text-lg mb-6">Cambiar contraseña</h2>
          <ChangePasswordForm />
        </div>

      </div>
    </Layout>
  );
};

export default MyAccount;