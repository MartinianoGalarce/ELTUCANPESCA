// ─── Dependencias ──────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/layout/Layout';

// NOTE: mapeo de estados a colores y etiquetas para mostrar en la UI
const STATUS_MAP = {
  pending:          { label: 'Pendiente',           color: 'bg-gray-100 text-gray-600' },
  awaiting_payment: { label: 'Esperando pago',      color: 'bg-yellow-100 text-yellow-700' },
  paid:             { label: 'Pagado',               color: 'bg-blue-100 text-blue-700' },
  preparing:        { label: 'Preparando',           color: 'bg-purple-100 text-purple-700' },
  shipped:          { label: 'Enviado',              color: 'bg-indigo-100 text-indigo-700' },
  delivered:        { label: 'Entregado',            color: 'bg-green-100 text-green-700' },
  failed:           { label: 'Pago fallido',         color: 'bg-red-100 text-red-600' },
  cancelled:        { label: 'Cancelado',            color: 'bg-red-100 text-red-600' },
};

// ─── Componente para subir comprobante ─────────────────────────────────────
const ReceiptUploader = ({ orderId, onUploaded }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('receipt', file);
      const res = await api.post(`/orders/${orderId}/receipt`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onUploaded(res.data.url);
    } catch {
      setError('Error al subir el comprobante, intentá de nuevo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-3">
      <label className={`flex items-center gap-2 cursor-pointer w-fit text-xs font-medium px-3 py-2 rounded-lg border transition-colors ${
        uploading
          ? 'border-gray-200 text-gray-400 cursor-not-allowed'
          : 'border-amber-400 text-amber-700 hover:bg-amber-100'
      }`}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        {uploading ? 'Subiendo...' : 'Subir comprobante'}
        <input
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          disabled={uploading}
          onChange={handleFile}
        />
      </label>
      {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
    </div>
  );
};

// ─── Componente principal ──────────────────────────────────────────────────
const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/my-orders')
      .then((res) => setOrders(res.data))
      .catch((err) => console.error('Error cargando pedidos:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12 text-gray-400">Cargando pedidos...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-dark mb-8">Mis pedidos</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🎣</div>
          <p className="text-gray-500 mb-6">Todavía no hiciste ningún pedido.</p>
          <Link
            to="/productos"
            className="bg-primary hover:bg-primary-dark text-white font-bold px-6 py-3 rounded-xl transition-colors"
          >
            Ver productos
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = STATUS_MAP[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-600' };
            return (
              <div key={order._id} className="bg-white border border-gray-200 rounded-2xl p-6">

                {/* ─── Header ─────────────────────────────────────────── */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-xs text-gray-400 font-mono mb-1">#{order._id.slice(-8).toUpperCase()}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('es-AR', {
                        day: '2-digit', month: 'long', year: 'numeric'
                      })}
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${status.color}`}>
                    {status.label}
                  </span>
                </div>

                {/* ─── Items ──────────────────────────────────────────── */}
                <div className="space-y-1 mb-4">
                  {order.items.map((item) => (
                    <div key={item._id} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.name} x{item.quantity}</span>
                      <span className="text-dark font-medium">
                        ${(item.price * item.quantity).toLocaleString('es-AR')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* ─── Total ──────────────────────────────────────────── */}
                <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                  <div className="font-bold text-dark">
                    Total: ${order.total.toLocaleString('es-AR')}
                  </div>
                  <div className="text-xs text-gray-400 capitalize">
                    {order.paymentMethod === 'transfer' ? 'Transferencia' : 'Mercado Pago'}
                  </div>
                </div>

                {/* ─── Transferencia pendiente + comprobante ──────────── */}
                {order.status === 'awaiting_payment' && order.paymentMethod === 'transfer' && (
                  <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
                    <div className="font-medium mb-1">Pendiente de pago</div>
                    <div>CBU: <span className="font-mono">0000000000000000000000</span></div>
                    <div>Alias: <span className="font-mono">ELTUCAN.PESCA</span></div>
                    <div>Referencia: <span className="font-mono">#{order._id.slice(-8).toUpperCase()}</span></div>

                    {order.transferReceipt ? (
                      <div className="mt-3 flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                        <span>✅ Comprobante enviado</span>
                        
                        <a  href={order.transferReceipt}
                          target="_blank"
                          rel="noreferrer"
                          className="underline text-xs ml-auto"
                        >
                          Ver
                        </a>
                      </div>
                    ) : (
                      <ReceiptUploader
                        orderId={order._id}
                        onUploaded={(url) => {
                          setOrders(prev => prev.map(o =>
                            o._id === order._id ? { ...o, transferReceipt: url } : o
                          ));
                        }}
                      />
                    )}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
};

export default MyOrders;