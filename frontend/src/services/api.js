// ─── Instancia de axios configurada para el backend ────────────────────────
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// NOTE: interceptor que agrega el token JWT automáticamente en cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// NOTE: interceptor que maneja el 401 — token expirado o inválido
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;