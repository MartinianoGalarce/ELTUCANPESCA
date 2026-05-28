// ─── Dependencias ──────────────────────────────────────────────────────────
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
      <div className="bg-accent text-white text-center text-xs py-2 font-medium tracking-wide uppercase">
        10% OFF pagando vía transferencia bancaria · Envíos a todo el país
      </div>

      {/* ─── Navbar principal ───────────────────────────────────────── */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">

            {/* ─── Logo ───────────────────────────────────────────────── */}
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <img src="/logo_tucan.jpg" alt="El Tucán Pesca" className="h-10 w-10 rounded-full object-cover" />
              <span className="text-2xl font-bold text-dark tracking-tight">
                El Tucán <span className="text-primary">Pesca</span>
              </span>
            </Link>
            
          {/* ─── Links principales ──────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <Link to="/" className="hover:text-dark transition-colors">
              Home
            </Link>
            <Link
              to="/productos"
              className="hover:text-dark transition-colors"
            >
              Catálogo
            </Link>
            {user && (
              <Link to="/mis-pedidos" className="hover:text-dark transition-colors">
                Mis Pedidos
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin" className="hover:text-dark transition-colors">
                Admin
              </Link>
            )}
          </div>

          {/* ─── Iconos derecha ─────────────────────────────────────── */}
          <div className="flex items-center gap-4">

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
                >
                  ✕
                </button>
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
                >
                  Salir
                </button>
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