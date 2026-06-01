// ─── Dependencias ──────────────────────────────────────────────────────────
import Navbar from './Navbar';

const WHATSAPP_NUMBER = '5492281541007';
const WHATSAPP_MSG = encodeURIComponent('Hola! Quería consultar sobre un producto 🎣');

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


      {/* ─── Botón WhatsApp flotante ─────────────────────────────────── */}
      
      <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Contactar por WhatsApp"
        className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110"
      >
        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.121 1.532 5.849L.057 23.5a.5.5 0 00.61.635l5.797-1.523A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.893a9.866 9.866 0 01-5.031-1.378l-.36-.214-3.733.981.995-3.63-.235-.374A9.862 9.862 0 012.107 12C2.107 6.527 6.527 2.107 12 2.107S21.893 6.527 21.893 12 17.473 21.893 12 21.893z"/>
        </svg>
      </a>
    </div>
  );
};

export default Layout;