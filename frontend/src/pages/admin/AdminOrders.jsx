// ─── Dependencias ──────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import AdminLayout from '../../components/layout/AdminLayout';

const STATUS_MAP = {
  pending:          { label: 'Pendiente',        color: 'bg-gray-100 text-gray-600' },
  awaiting_payment: { label: 'Esperando pago',   color: 'bg-yellow-100 text-yellow-700' },
  paid:             { label: 'Pagado',            color: 'bg-blue-100 text-blue-700' },
  preparing:        { label: 'Preparando',        color: 'bg-purple-100 text-purple-700' },
  shipped:          { label: 'Enviado',           color: 'bg-indigo-100 text-indigo-700' },
  delivered:        { label: 'Entregado',         color: 'bg-green-100 text-green-700' },
  failed:           { label: 'Pago fallido',      color: 'bg-red-100 text-red-600' },
  cancelled:        { label: 'Cancelado',         color: 'bg-red-100 text-red-600' },
};

// NOTE: transiciones válidas por estado — igual que en el backend
const VALID_TRANSITIONS = {
  pending:          ['paid', 'awaiting_payment', 'failed', 'cancelled'],
  awaiting_payment: ['paid', 'cancelled'],
  paid:             ['preparing', 'cancelled'],
  preparing:        ['shipped', 'cancelled'],
  shipped:          ['delivered', 'cancelled'],
  delivered:        [],
  failed:           [],
  cancelled:        [],
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [expandedOrder, setExpandedOrder] = useState(null);

  const statusFilter = searchParams.get('status') || '';

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: 50 });
      if (statusFilter) params.append('status', statusFilter);
      const res = await api.get(`/orders?${params}`);
      setOrders(res.data.orders);
    } catch (error) {
      console.error('Error cargando órdenes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [statusFilter]);

  const [statusLoading, setStatusLoading] = useState(null);

  const handleStatusChange = async (orderId, newStatus) => {
    setStatusLoading(`${orderId}-${newStatus}`);
    try {
      const res = await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => o._id === orderId ? { ...o, status: res.data.status } : o)
      );
    } catch (error) {
      console.error('Error actualizando estado:', error);
    } finally {
      setStatusLoading(null);
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-dark">Órdenes</h1>
        <div className="text-sm text-gray-500">{orders.length} órdenes</div>
      </div>

      {/* ─── Filtros por estado ───────────────────────────────────────────── */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['', 'awaiting_payment', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled'].map((s) => (
          <button
            key={s}
            onClick={() => setSearchParams(s ? { status: s } : {})}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              statusFilter === s
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s ? STATUS_MAP[s]?.label : 'Todas'}
          </button>
        ))}
      </div>

      {/* ─── Lista de órdenes ─────────────────────────────────────────────── */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Cargando órdenes...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No hay órdenes</div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const status = STATUS_MAP[order.status];
            const transitions = VALID_TRANSITIONS[order.status] || [];
            const isExpanded = expandedOrder === order._id;

            return (
              <div key={order._id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                {/* ─── Fila principal ─────────────────────────────────── */}
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="font-mono text-xs text-gray-400">
                        #{order._id.slice(-8).toUpperCase()}
                      </div>
                      <div className="font-medium text-dark text-sm">
                        {order.user?.name || 'Cliente'}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString('es-AR')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-bold text-dark">
                        ${order.total.toLocaleString('es-AR')}
                      </div>
                      <div className="text-xs text-gray-400">
                        {order.paymentMethod === 'transfer' ? 'Transferencia' : 'Mercado Pago'}
                      </div>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${status?.color}`}>
                      {status?.label}
                    </span>
                    <span className="text-gray-400">{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </div>

                {/* ─── Detalle expandido ──────────────────────────────── */}
                {isExpanded && (
                  <div className="border-t border-gray-100 p-4 bg-gray-50">
                    <div className="grid grid-cols-2 gap-6">
                      {/* ─── Items ────────────────────────────────────── */}
                      <div>
                        <div className="text-xs font-medium text-gray-500 mb-2">PRODUCTOS</div>
                        <div className="space-y-1">
                          {order.items.map((item) => (
                            <div key={item._id} className="flex justify-between text-sm">
                              <span className="text-gray-600">{item.name} x{item.quantity}</span>
                              <span className="font-medium">${(item.price * item.quantity).toLocaleString('es-AR')}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* ─── Dirección ────────────────────────────────── */}
                      <div>
                        <div className="text-xs font-medium text-gray-500 mb-2">DIRECCIÓN</div>
                        <div className="text-sm text-gray-600">
                          {order.shippingAddress?.street} {order.shippingAddress?.number}<br />
                          {order.shippingAddress?.city}, {order.shippingAddress?.province}<br />
                          Tel: {order.shippingAddress?.phone}
                        </div>
                      </div>
                    </div>

                    {/* ─── Comprobante de transferencia ────────────────── */}
                    {order.paymentMethod === 'transfer' && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="text-xs font-medium text-gray-500 mb-2">COMPROBANTE</div>
                        {order.transferReceipt ? (
                          
                          <a href={order.transferReceipt}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-dark font-medium transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Ver comprobante
                          </a>
                        ) : (
                          <span className="text-sm text-gray-400">Sin comprobante todavía</span>
                        )}
                      </div>
                    )}
                    
                    {/* ─── Cambiar estado ───────────────────────────────── */}
                    {transitions.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="text-xs font-medium text-gray-500 mb-2">CAMBIAR ESTADO</div>
                        <div className="flex gap-2 flex-wrap">
                          {transitions.map((t) => (
                            <button
                              key={t}
                              onClick={() => handleStatusChange(order._id, t)}
                              disabled={statusLoading === `${order._id}-${t}`}
                              className="text-xs px-3 py-1.5 bg-white border border-gray-300 hover:border-primary hover:text-primary rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {statusLoading === `${order._id}-${t}` ? 'Procesando...' : `→ ${STATUS_MAP[t]?.label}`}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminOrders;