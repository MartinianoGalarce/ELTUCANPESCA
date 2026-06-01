// ─── Dependencias ──────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/layout/Layout';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // loading | success | error

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      return;
    }
    api.get(`/auth/verify-email?token=${token}`)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, []);

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-20 text-center">
        {status === 'loading' && (
          <div className="text-gray-400">Verificando tu cuenta...</div>
        )}
        {status === 'success' && (
          <>
            <div className="text-6xl mb-6">✅</div>
            <h1 className="text-2xl font-bold text-dark mb-3">¡Email verificado!</h1>
            <p className="text-gray-500 mb-8">Tu cuenta está activa. Ya podés iniciar sesión.</p>
            <Link
              to="/login"
              className="bg-primary hover:bg-primary-dark text-white font-bold px-6 py-3 rounded-xl transition-colors"
            >
              Iniciar sesión
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-6xl mb-6">❌</div>
            <h1 className="text-2xl font-bold text-dark mb-3">Link inválido o expirado</h1>
            <p className="text-gray-500 mb-8">El link de verificación expiró o ya fue usado.</p>
            <Link
              to="/registro"
              className="bg-primary hover:bg-primary-dark text-white font-bold px-6 py-3 rounded-xl transition-colors"
            >
              Volver al registro
            </Link>
          </>
        )}
      </div>
    </Layout>
  );
};

export default VerifyEmail;