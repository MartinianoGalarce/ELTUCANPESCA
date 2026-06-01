// ─── Dependencias ──────────────────────────────────────────────────────────
import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/layout/Layout';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch {
      setError('Error al procesar la solicitud, intentá de nuevo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-12">
        <div className="bg-white border border-gray-200 rounded-2xl p-8">
          {sent ? (
            <div className="text-center">
              <div className="text-5xl mb-4">📧</div>
              <h1 className="text-xl font-bold text-dark mb-2">Revisá tu email</h1>
              <p className="text-gray-500 text-sm mb-6">
                Si el email está registrado vas a recibir un link para resetear tu contraseña.
              </p>
              <Link to="/login" className="text-primary font-medium hover:underline text-sm">
                Volver al login
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-dark mb-2">Recuperar contraseña</h1>
              <p className="text-gray-500 text-sm mb-8">
                Ingresá tu email y te enviamos un link para resetear tu contraseña.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary"
                    placeholder="tu@email.com"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60"
                >
                  {loading ? 'Enviando...' : 'Enviar link'}
                </button>
              </form>

              <div className="text-center mt-4">
                <Link to="/login" className="text-sm text-gray-400 hover:text-primary transition-colors">
                  Volver al login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ForgotPassword;