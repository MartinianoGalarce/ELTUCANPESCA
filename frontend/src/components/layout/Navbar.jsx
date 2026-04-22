// ─── Dependencias ──────────────────────────────────────────────────────────
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header>
      {/* ─── Barra promocional ──────────────────────────────────────── */}
      <div className="bg-accent text-white text-center text-sm py-2 font-medium">
        10% de descuento pagando con transferencia bancaria
      </div>

      {/* ─── Navbar principal ───────────────────────────────────────── */}
      <nav className="bg-dark text-white px-6 py-4 flex items-center justify-between shadow-lg">

        {/* ─── Logo ─────────────────────────────────────────────────── */}
        <Link to="/" className="flex items-center gap-3 hover:opacity-90">
          <img src="/logo_tucan.jpg" alt="El Tucán" className="h-12 w-12 rounded-full object-cover" />
          <div className="leading-tight">
            <div className="text-primary-light font-bold text-lg tracking-wide">EL TUCÁN</div>
            <div className="text-gray-400 text-xs">pesca & camping</div>
          </div>
        </Link>

        {/* ─── Links principales ────────────────────────────────────── */}
        <div className="flex items-center gap-6 text-sm">
          <Link to="/productos" className="hover:text-primary-light transition-colors">
            Productos
          </Link>

          {/* ─── Carrito ──────────────────────────────────────────── */}
          <Link to="/carrito" className="relative hover:text-primary-light transition-colors">
            Carrito
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-4 bg-accent text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>

          {/* ─── Auth ─────────────────────────────────────────────── */}
          {user ? (
            <>
              {user.role === 'admin' && (
                <Link to="/admin" className="hover:text-primary-light transition-colors">
                  Dashboard
                </Link>
              )}
              <Link to="/mi-cuenta" className="hover:text-primary-light transition-colors">
                {user.name}
              </Link>
              <button
                onClick={handleLogout}
                className="hover:text-accent transition-colors"
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-primary-light transition-colors">
                Ingresar
              </Link>
              <Link
                to="/registro"
                className="bg-primary hover:bg-primary-light text-white px-4 py-2 rounded font-semibold transition-colors"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;