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
      <footer className="bg-dark text-gray-400 text-sm py-12 px-6 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Col 1 — Marca */}
          <div>
            <div className="text-white font-bold text-lg mb-2">El Tucán Pesca</div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Equipando tus mejores aventuras desde 1998. Somos expertos en pesca deportiva y camping.
            </p>
            <a href="https://maps.app.goo.gl/cT6qEuyvkv8vNyT77" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-gray-500 hover:text-white transition-colors text-xs mt-3 w-fit">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Tapalque, Buenos Aires
            </a>
          </div>

          {/* Col 2 — Navegación */}
          <div>
            <div className="text-gray-300 font-semibold text-xs uppercase tracking-wider mb-3">Información</div>
            <div className="flex flex-col gap-2 text-gray-500">
              <a href="https://instagram.com/_eltucanpesca" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram: @_eltucanpesca</a>
              <span className="hover:text-white cursor-pointer transition-colors">Envíos y devoluciones</span>
              <span className="hover:text-white cursor-pointer transition-colors">Términos y condiciones</span>
            </div>
          </div>

          {/* Col 3 — Pagos */}
          <div>
            <div className="text-gray-300 font-semibold text-xs uppercase tracking-wider mb-3">Pagos y envíos</div>
            <div className="flex gap-2 flex-wrap">
              <span className="bg-gray-800 text-gray-300 text-xs px-3 py-1 rounded">Mercado Pago</span>
              <span className="bg-gray-800 text-gray-300 text-xs px-3 py-1 rounded">Transferencia</span>
              <span className="bg-gray-800 text-gray-300 text-xs px-3 py-1 rounded">Envíos a todo el país</span>
              <span className="bg-gray-800 text-gray-300 text-xs px-3 py-1 rounded">Retiro en Tapalque</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-gray-800 mt-8 pt-6 text-center text-xs text-gray-600">
          © 2026 El Tucán Pesca & Camping — Todos los derechos reservados
        </div>
      </footer>
    </div>
  );
};

export default Layout;