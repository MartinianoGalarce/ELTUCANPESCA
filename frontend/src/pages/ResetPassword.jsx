// ─── Dependencias ──────────────────────────────────────────────────────────
import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/layout/Layout';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      navigate('/login?reset=ok');
    } catch (err) {
      setError(err.response?.data?.error || 'Token inválido o expirado');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <Layout>
        <div className="max-w-md mx-auto mt-12 text-center">
          <div className="text-5xl mb-4">❌</div>
          <h1 className="text-xl font-bold text-dark mb-2">Link inválido</h1>
          <Link to="/olvide-contrasena" className="text-primary font-medium hover:underline text-sm">
            Solicitar nuevo link
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-12">
        <div className="bg-white border border-gray-200 rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-dark mb-2">Nueva contraseña</h1>
          <p className="text-gray-500 text-sm mb-8">Ingresá tu nueva contraseña.</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-1">Nueva contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1">Confirmar contraseña</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
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
              {loading ? 'Guardando...' : 'Guardar contraseña'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default ResetPassword;