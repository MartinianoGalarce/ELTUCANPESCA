// ─── Dependencias ──────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import api from '../../services/api';
import AdminLayout from '../../components/layout/AdminLayout';

// ─── Componente de card de stat ────────────────────────────────────────────
const StatCard = ({ title, value, sub, color = 'text-dark' }) => (
  <div className="bg-white border border-gray-200 rounded-2xl p-6">
    <div className="text-sm text-gray-500 mb-2">{title}</div>
    <div className={`text-2xl font-bold ${color} mb-1`}>{value}</div>
    {sub && <div className="text-xs text-gray-400">{sub}</div>}
  </div>
);

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [salesByDay, setSalesByDay] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [inventoryValue, setInventoryValue] = useState(null);
  const [ordersByStatus, setOrdersByStatus] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [newCustomers, setNewCustomers] = useState([]);
  const [pendingTransfers, setPendingTransfers] = useState([]);
  const [noImageProducts, setNoImageProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const to = now.toISOString().split('T')[0];

    Promise.all([
      api.get(`/stats/sales/summary?from=${from}&to=${to}`),
      api.get(`/stats/sales/by-day?from=${from}&to=${to}`),
      api.get('/stats/products/top-selling?limit=5'),
      api.get('/stats/products/low-stock?threshold=5'),
      api.get('/stats/products/inventory-value'),
      api.get('/stats/orders/by-status'),
      api.get('/stats/orders/recent?limit=5'),
      api.get(`/stats/customers/new?from=${from}&to=${to}`),
      api.get('/orders?status=awaiting_payment&limit=10'),
      api.get('/products?limit=100'),
    ]).then(([
      summaryRes, salesByDayRes, topProductsRes, lowStockRes,
      inventoryRes, ordersByStatusRes, recentOrdersRes,
      newCustomersRes, pendingTransfersRes, allProductsRes,
    ]) => {
      setSummary(summaryRes.data);
      setSalesByDay(salesByDayRes.data.map((d) => ({
        date: d._id.slice(5),
        ventas: d.revenue,
      })));
      setTopProducts(topProductsRes.data);
      setLowStock(lowStockRes.data);
      setInventoryValue(inventoryRes.data);
      setOrdersByStatus(ordersByStatusRes.data);
      setRecentOrders(recentOrdersRes.data);
      setNewCustomers(newCustomersRes.data.reduce((acc, d) => acc + d.newUsers, 0));
      setPendingTransfers(pendingTransfersRes.data.orders || []);
      // NOTE: filtrar productos sin imagen para mostrar alerta
      setNoImageProducts(
        allProductsRes.data.products.filter((p) => !p.images || p.images.length === 0)
      );
    }).catch((err) => console.error('Error cargando stats:', err))
      .finally(() => setLoading(false));
  }, []);

  const STATUS_LABELS = {
    pending: 'Pendiente', awaiting_payment: 'Esp. pago',
    paid: 'Pagado', preparing: 'Preparando',
    shipped: 'Enviado', delivered: 'Entregado',
    failed: 'Fallido', cancelled: 'Cancelado',
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-20 text-gray-400">Cargando dashboard...</div>
      </AdminLayout>
    );
  }

  const grossProfit = summary ? summary.totalRevenue * 0.4 : 0;

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Resumen del mes actual</p>
      </div>

      {/* ─── Alertas ────────────────────────────────────────────────────── */}
      <div className="space-y-3 mb-8">
        {pendingTransfers.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-yellow-800 text-sm font-medium">
              {pendingTransfers.length} transferencia{pendingTransfers.length > 1 ? 's' : ''} pendiente{pendingTransfers.length > 1 ? 's' : ''} de confirmar
            </span>
            <Link to="/admin/ordenes?status=awaiting_payment" className="text-yellow-700 text-sm font-bold hover:underline">
              Ver →
            </Link>
          </div>
        )}
        {lowStock.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-red-700 text-sm font-medium">
              {lowStock.length} producto{lowStock.length > 1 ? 's' : ''} con stock bajo
            </span>
            <Link to="/admin/productos" className="text-red-700 text-sm font-bold hover:underline">
              Ver →
            </Link>
          </div>
        )}
        {noImageProducts.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-blue-700 text-sm font-medium">
              {noImageProducts.length} producto{noImageProducts.length > 1 ? 's' : ''} sin imagen
            </span>
            <Link to="/admin/productos" className="text-blue-700 text-sm font-bold hover:underline">
              Ver →
            </Link>
          </div>
        )}
      </div>

      {/* ─── Stats principales ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Ventas del mes"
          value={`$${(summary?.totalRevenue || 0).toLocaleString('es-AR')}`}
          sub={`${summary?.totalOrders || 0} órdenes`}
          color="text-primary"
        />
        <StatCard
          title="Ticket promedio"
          value={`$${Math.round(summary?.avgTicket || 0).toLocaleString('es-AR')}`}
          sub="por orden"
        />
        <StatCard
          title="Ganancia bruta est."
          value={`$${Math.round(grossProfit).toLocaleString('es-AR')}`}
          sub="~40% del total vendido"
          color="text-accent"
        />
        <StatCard
          title="Clientes nuevos"
          value={newCustomers}
          sub="este mes"
          color="text-blue-600"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          title="Valor del inventario"
          value={`$${(inventoryValue?.totalValue || 0).toLocaleString('es-AR')}`}
          sub={`${inventoryValue?.totalProducts || 0} productos · ${inventoryValue?.totalStock || 0} unidades`}
        />
        <StatCard
          title="Transferencias pendientes"
          value={pendingTransfers.length}
          sub="esperando confirmación"
          color={pendingTransfers.length > 0 ? 'text-yellow-600' : 'text-dark'}
        />
        <StatCard
          title="Productos sin imagen"
          value={noImageProducts.length}
          sub="requieren foto"
          color={noImageProducts.length > 0 ? 'text-blue-600' : 'text-dark'}
        />
      </div>

      {/* ─── Gráfico de ventas por día ───────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
        <h2 className="font-bold text-dark mb-6">Ventas por día — este mes</h2>
        {salesByDay.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={salesByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => [`$${v.toLocaleString('es-AR')}`, 'Ventas']} />
              <Line type="monotone" dataKey="ventas" stroke="#2D6A2D" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-8 text-gray-400 text-sm">Sin ventas este mes todavía</div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

        {/* ─── Productos más vendidos ───────────────────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="font-bold text-dark mb-6">Top 5 productos más vendidos</h2>
          {topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={120} />
                <Tooltip formatter={(v) => [v, 'Unidades vendidas']} />
                <Bar dataKey="totalQuantity" fill="#2D6A2D" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">Sin datos todavía</div>
          )}
        </div>

        {/* ─── Órdenes por estado ───────────────────────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="font-bold text-dark mb-6">Órdenes por estado</h2>
          <div className="space-y-3">
            {ordersByStatus.map((item) => (
              <div key={item._id} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{STATUS_LABELS[item._id] || item._id}</span>
                <span className="font-bold text-dark">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Últimas órdenes ─────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-dark">Últimas órdenes</h2>
          <Link to="/admin/ordenes" className="text-primary text-sm font-medium hover:underline">
            Ver todas →
          </Link>
        </div>
        <div className="space-y-3">
          {recentOrders.map((order) => (
            <div key={order._id} className="flex items-center justify-between text-sm border-b border-gray-100 pb-3 last:border-0 last:pb-0">
              <div>
                <div className="font-mono text-xs text-gray-400">#{order._id.slice(-8).toUpperCase()}</div>
                <div className="text-gray-600">{order.user?.name || 'Cliente'}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-dark">${order.total.toLocaleString('es-AR')}</div>
                <div className="text-xs text-gray-400">{STATUS_LABELS[order.status]}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;