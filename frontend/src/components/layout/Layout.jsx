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
          </div>

          {/* Col 2 — Navegación */}
          <div>
            <div className="text-gray-300 font-semibold text-xs uppercase tracking-wider mb-3">Información</div>
            <div className="flex flex-col gap-2 text-gray-500">
              <span className="hover:text-white cursor-pointer transition-colors">Instagram: @eltucanpesca</span>
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
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-gray-800 mt-8 pt-6 text-center text-xs text-gray-600">
          © 2025 El Tucán Pesca & Camping — Todos los derechos reservados
        </div>
      </footer>
    </div>
  );
};

export default Layout;