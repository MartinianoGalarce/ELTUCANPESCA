// ─── Dependencias ──────────────────────────────────────────────────────────
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/productos', label: 'Productos', icon: '🎣' },
    { path: '/admin/categorias', label: 'Categorías', icon: '📁' },
    { path: '/admin/ordenes', label: 'Órdenes', icon: '📦' },
    { path: '/admin/venta-presencial', label: 'Venta presencial', icon: '💵' },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">

      {/* ─── Sidebar ────────────────────────────────────────────────────── */}
      <aside className="w-56 bg-dark text-white flex flex-col fixed h-full">
        <div className="p-6 border-b border-gray-700">
          <Link to="/" className="block">
            <div className="text-primary-light font-bold text-lg">EL TUCÁN</div>
            <div className="text-gray-400 text-xs">Panel de administración</div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-primary text-white font-medium'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <span style={{ fontSize: '16px' }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <div className="text-sm text-gray-400 mb-1">{user?.name}</div>
          <div className="text-xs text-gray-600 mb-3">{user?.email}</div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-red-400 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ─── Contenido principal ────────────────────────────────────────── */}
      <main className="flex-1 ml-56 p-8">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;