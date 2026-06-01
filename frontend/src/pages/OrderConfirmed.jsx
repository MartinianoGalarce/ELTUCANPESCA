// ─── Dependencias ──────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/layout/Layout';

const OrderConfirmed = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then((res) => setOrder(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12 text-gray-400">Cargando...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-lg mx-auto mt-12 text-center">
        <div className="text-6xl mb-6">🎣</div>
        <h1 className="text-3xl font-bold text-primary mb-2">¡Pedido confirmado!</h1>
        <p className="text-gray-500 mb-8">
          Tu pedido fue recibido correctamente.
        </p>

        {order && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 text-left mb-8">

            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-500">Número de pedido</span>
              <span className="font-mono text-xs text-dark">{order._id}</span>
            </div>

            {/* ─── Items ──────────────────────────────────────────────── */}
            <div className="space-y-2 mb-4">
              {order.items.map((item) => (
                <div key={item._id} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.name} x{item.quantity}</span>
                  <span className="font-medium">${(item.price * item.quantity).toLocaleString('es-AR')}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4 mb-4">
              <div className="flex justify-between font-bold text-dark">
                <span>Total</span>
                <span>${order.total.toLocaleString('es-AR')}</span>
              </div>
            </div>

            {/* ─── Info de pago según método ───────────────────────── */}
            {order.paymentMethod === 'transfer' && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm">
                <div className="font-medium text-amber-800 mb-2">Datos para la transferencia</div>
                <div className="text-amber-700 space-y-1">
                  <div>CBU: <span className="font-mono">0000000000000000000000</span></div>
                  <div>Alias: <span className="font-mono">ELTUCAN.PESCA</span></div>
                  <div className="font-medium mt-2">
                    Referencia: #{order._id.slice(-8).toUpperCase()}
                  </div>
                </div>
                <div className="text-xs text-amber-600 mt-2">
                  Una vez confirmado el pago te avisamos por email.
                </div>
                <Link
                  to="/mis-pedidos"
                  className="inline-block mt-2 text-xs text-amber-700 font-medium underline hover:text-amber-900 transition-colors"
                >
                  → Subir comprobante desde Mis Pedidos
                </Link>
              </div>
            )}

            {order.paymentMethod === 'mercadopago' && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
                Tu pago está siendo procesado por Mercado Pago.
              </div>
            )}
          </div>
        )}

        <div className="flex gap-4 justify-center">
          <Link
            to="/mis-pedidos"
            className="bg-primary hover:bg-primary-dark text-white font-bold px-6 py-3 rounded-xl transition-colors"
          >
            Ver mis pedidos
          </Link>
          <Link
            to="/productos"
            className="border border-gray-300 text-gray-600 hover:border-primary hover:text-primary font-medium px-6 py-3 rounded-xl transition-colors"
          >
            Seguir comprando
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default OrderConfirmed;