// ─── Dependencias ──────────────────────────────────────────────────────────
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/productos', label: 'Productos', icon: '🎣' },
    { path: '/admin/categorias', label: 'Categorias', icon: '📁' },
    { path: '/admin/ordenes', label: 'Ordenes', icon: '📦' },
    { path: '/admin/venta-presencial', label: 'Venta presencial', icon: '💵' },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-gray-700">
        <Link to="/" className="block" onClick={() => setSidebarOpen(false)}>
          <div className="text-primary-light font-bold text-lg">EL TUCAN</div>
          <div className="text-gray-400 text-xs">Panel de administracion</div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
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
          Cerrar sesion
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-gray-50">

      {/* ─── Sidebar desktop ────────────────────────────────────────────── */}
      <aside className="hidden md:flex w-56 bg-dark text-white flex-col fixed h-full z-30">
        <SidebarContent />
      </aside>

      {/* ─── Drawer mobile ──────────────────────────────────────────────── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-56 bg-dark text-white flex flex-col z-50">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ─── Contenido principal ────────────────────────────────────────── */}
      <main className="flex-1 md:ml-56">

        {/* ─── Header mobile ──────────────────────────────────────────── */}
        <div className="md:hidden bg-dark text-white px-4 py-3 flex items-center justify-between sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-primary-light font-bold text-sm">EL TUCAN — Admin</span>
          <div className="w-6" />
        </div>

        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;