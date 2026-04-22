// ─── Dependencias ──────────────────────────────────────────────────────────
import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {children}
      </main>
      {/* ─── Footer ─────────────────────────────────────────────────── */}
      <footer className="bg-dark text-gray-400 text-sm py-8 px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-4">
          <div>
            <div className="text-primary-light font-bold text-base mb-1">EL TUCÁN</div>
            <div>pesca & camping</div>
          </div>
          <div>
            <div className="text-white font-medium mb-1">Contacto</div>
            <div>Instagram: @eltucanpesca</div>
          </div>
          <div>
            <div className="text-white font-medium mb-1">Medios de pago</div>
            <div>Mercado Pago · Transferencia bancaria</div>
          </div>
        </div>
        <div className="text-center mt-6 text-xs text-gray-600">
          © 2025 El Tucán Pesca & Camping — Todos los derechos reservados
        </div>
      </footer>
    </div>
  );
};

export default Layout;