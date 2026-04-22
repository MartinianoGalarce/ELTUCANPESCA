// ─── Dependencias ──────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import api from '../../services/api';
import AdminLayout from '../../components/layout/AdminLayout';

const AdminSalePresencial = () => {
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([{ product: '', quantity: 1, price: 0, name: '' }]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/products?limit=100').then((res) => setProducts(res.data.products));
  }, []);

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;

    // NOTE: al seleccionar un producto, autocompletar precio y nombre
    if (field === 'product') {
      const found = products.find((p) => p._id === value);
      if (found) {
        updated[index].price = found.price;
        updated[index].name = found.name;
      }
    }
    setItems(updated);
  };

  const addItem = () => {
    setItems([...items, { product: '', quantity: 1, price: 0, name: '' }]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validItems = items.filter((i) => i.product && i.quantity > 0);
    if (validItems.length === 0) {
      setError('Agregá al menos un producto');
      return;
    }

    setLoading(true);
    try {
      // NOTE: las ventas presenciales se registran como órdenes con
      // status "delivered" y dirección de retiro en local
      const orderData = {
        paymentMethod: 'transfer',
        shippingAddress: {
          street: 'Retiro en local',
          number: 's/n',
          city: 'Buenos Aires',
          province: 'CABA',
          zip: '0000',
          phone: '0000000000',
        },
        items: validItems.map((i) => ({
          product: i.product,
          quantity: Number(i.quantity),
        })),
      };

      const res = await api.post('/orders', orderData);

      // NOTE: marcar inmediatamente como delivered ya que fue venta en el local
      await api.patch(`/orders/${res.data._id}/status`, { status: 'paid' });
      await api.patch(`/orders/${res.data._id}/status`, { status: 'preparing' });
      await api.patch(`/orders/${res.data._id}/status`, { status: 'shipped' });
      await api.patch(`/orders/${res.data._id}/status`, { status: 'delivered' });

      setSuccess({
        id: res.data._id,
        total,
        items: validItems,
      });
      setItems([{ product: '', quantity: 1, price: 0, name: '' }]);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar la venta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-dark mb-2">Venta presencial</h1>
        <p className="text-gray-500 text-sm mb-8">
          Registrá una venta realizada en el local para actualizar el stock y las estadísticas.
        </p>

        {/* ─── Confirmación de venta exitosa ────────────────────────────── */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6">
            <div className="text-green-700 font-bold text-lg mb-2">Venta registrada</div>
            <div className="text-green-600 text-sm space-y-1">
              {success.items.map((item, i) => (
                <div key={i}>{item.name} x{item.quantity} — ${(item.price * item.quantity).toLocaleString('es-AR')}</div>
              ))}
              <div className="font-bold pt-2 border-t border-green-200 mt-2">
                Total: ${success.total.toLocaleString('es-AR')}
              </div>
            </div>
            <button
              onClick={() => setSuccess(null)}
              className="mt-4 text-sm text-green-700 font-medium hover:underline"
            >
              Registrar otra venta
            </button>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            {/* ─── Items ──────────────────────────────────────────────── */}
            <div>
              <div className="text-sm font-medium text-dark mb-3">Productos vendidos</div>
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="flex gap-3 items-end">
                    <div className="flex-1">
                      <select
                        value={item.product}
                        onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                      >
                        <option value="">Seleccioná un producto</option>
                        {products.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.name} — ${p.price.toLocaleString('es-AR')} (stock: {p.stock})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-20">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                        placeholder="Cant."
                      />
                    </div>
                    <div className="w-28 text-sm font-medium text-dark text-right pb-2">
                      ${(item.price * item.quantity).toLocaleString('es-AR')}
                    </div>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-400 hover:text-red-600 pb-2"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addItem}
                className="mt-3 text-sm text-primary hover:text-primary-dark font-medium transition-colors"
              >
                + Agregar producto
              </button>
            </div>

            {/* ─── Método de pago ─────────────────────────────────────── */}
            <div>
              <div className="text-sm font-medium text-dark mb-3">Método de pago</div>
              <div className="flex gap-3">
                {[
                  { value: 'cash', label: 'Efectivo' },
                  { value: 'transfer', label: 'Transferencia' },
                  { value: 'card', label: 'Tarjeta' },
                ].map((method) => (
                  <label
                    key={method.value}
                    className={`flex items-center gap-2 px-4 py-2 border-2 rounded-xl cursor-pointer transition-colors text-sm ${
                      paymentMethod === method.value
                        ? 'border-primary bg-green-50 text-primary font-medium'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.value}
                      checked={paymentMethod === method.value}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="accent-primary"
                    />
                    {method.label}
                  </label>
                ))}
              </div>
            </div>

            {/* ─── Total ──────────────────────────────────────────────── */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between font-bold text-dark text-lg">
                <span>Total</span>
                <span>${total.toLocaleString('es-AR')}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60 text-lg"
            >
              {loading ? 'Registrando...' : 'Registrar venta'}
            </button>
          </form>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminSalePresencial;