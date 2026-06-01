// ─── Dependencias ──────────────────────────────────────────────────────────
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;

const Navbar = () => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // ─── Banner ─────────────────────────────────────────────────────────────
  const [bannerMessages, setBannerMessages] = useState([]);
  const [bannerActive, setBannerActive] = useState(true);
  const [currentMsg, setCurrentMsg] = useState(0);
  const intervalRef = useRef(null);

useEffect(() => {
  // NOTE: si ya tenemos los mensajes en session, los usamos directamente
  const cached = sessionStorage.getItem('bannerMessages');
  if (cached) {
    const parsed = JSON.parse(cached);
    setBannerMessages(parsed.messages);
    setBannerActive(parsed.active);
    return;
  }

  axios.get(`${API}/settings/banner`)
    .then(res => {
      if (res.data.messages?.length > 0) {
        setBannerMessages(res.data.messages);
        setBannerActive(res.data.active);
        // NOTE: guardamos en session para no volver a fetchear
        sessionStorage.setItem('bannerMessages', JSON.stringify({
          messages: res.data.messages,
          active: res.data.active,
        }));
      }
    })
    .catch(() => {});
}, []);

  useEffect(() => {
    if (bannerMessages.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrentMsg(prev => (prev + 1) % bannerMessages.length);
    }, 3500);
    return () => clearInterval(intervalRef.current);
  }, [bannerMessages]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/productos?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header>
      {/* ─── Barra promocional ──────────────────────────────────────── */}
      {bannerActive && bannerMessages.length > 0 && (
        <div className="bg-accent text-white text-center text-xs py-2 font-medium tracking-wide uppercase overflow-hidden">
          <span
            key={currentMsg}
            className="inline-block"
            style={{
              animation: 'bannerSlide 3.5s ease-in-out forwards',
            }}
          >
            {bannerMessages[currentMsg]}
          </span>
        </div>
      )}

      {/* ─── Navbar principal ───────────────────────────────────────── */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-6">

            {/* ─── Logo ───────────────────────────────────────────────── */}
            <Link to="/" className="flex-1 flex items-center gap-2">
              <img src="/logo_tucan.jpg" alt="El Tucán Pesca" className="h-10 w-10 rounded-full object-cover" />
              <span className="hidden sm:block text-2xl font-bold text-dark tracking-tight">
                El Tucán <span className="text-primary">Pesca</span>
              </span>
            </Link>
            
          {/* ─── Links principales ──────────────────────────────────── */}
            <div className="hidden md:flex flex-1 justify-center items-center gap-8 text-sm font-medium text-gray-600">
            <Link to="/" className="hover:text-dark transition-colors">Home</Link>
            <Link to="/productos" className="hover:text-dark transition-colors">Catálogo</Link>
            {user && (
              <Link to="/mis-pedidos" className="hover:text-dark transition-colors">Mis Pedidos</Link>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin" className="hover:text-dark transition-colors">Admin</Link>
            )}
          </div>

          {/* ─── Iconos derecha ─────────────────────────────────────── */}
          <div className="flex flex-1 justify-end items-center gap-4">

            {/* Búsqueda */}
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar equipos..."
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary w-48"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="text-gray-400 hover:text-dark text-lg"
                >✕</button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="text-gray-500 hover:text-dark transition-colors"
                aria-label="Buscar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            )}

            {/* Carrito */}
            <Link to="/carrito" className="relative text-gray-500 hover:text-dark transition-colors" aria-label="Carrito">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Usuario */}
            {user ? (
              <div className="flex items-center gap-3 text-sm">
                <Link to="/mi-cuenta" className="text-gray-500 hover:text-dark transition-colors" aria-label="Mi cuenta">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                >Salir</button>
              </div>
            ) : (
            <Link to="/login" className="text-gray-500 hover:text-dark transition-colors" aria-label="Ingresar">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;