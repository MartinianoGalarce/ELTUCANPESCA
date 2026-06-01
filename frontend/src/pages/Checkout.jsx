// ─── Dependencias ──────────────────────────────────────────────────────────
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Layout from '../components/layout/Layout';

const Checkout = () => {
  const { cart, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState('transfer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const [address, setAddress] = useState({
    street:   user?.address?.street   || '',
    number:   user?.address?.number   || '',
    city:     user?.address?.city     || '',
    province: user?.address?.province || '',
    zip:      user?.address?.zip      || '',
    phone:    user?.address?.phone    || '',
  });

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const orderData = {
        paymentMethod,
        shippingAddress: address,
        items: cart.map((item) => ({
          product: item._id,
          quantity: item.quantity,
        })),
      };
      const res = await api.post('/orders', orderData);
      // NOTE: marcar como confirmado antes de limpiar para evitar redirección al carrito
      setConfirmed(true);
      clearCart();
      navigate(`/orden-confirmada/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al procesar la orden');
    } finally {
      setLoading(false);
    }
  };

  // NOTE: solo redirigir al carrito si no se confirmó todavía
  if (cart.length === 0 && !confirmed) {
    navigate('/carrito');
    return null;
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-dark mb-8">Finalizar compra</h1>
      <div className="flex flex-col md:flex-row gap-8">

        {/* ─── Formulario ───────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="flex-1 space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="font-bold text-dark text-lg mb-4">Dirección de entrega</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-dark mb-1">Calle</label>
                <input
                  name="street"
                  value={address.street}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  placeholder="Av. Corrientes"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-1">Número</label>
                <input
                  name="number"
                  value={address.number}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  placeholder="1234"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-1">Ciudad</label>
                <input
                  name="city"
                  value={address.city}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  placeholder="Buenos Aires"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-1">Provincia</label>
                <input
                  name="province"
                  value={address.province}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  placeholder="CABA"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-1">Código postal</label>
                <input
                  name="zip"
                  value={address.zip}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  placeholder="1043"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-1">Teléfono</label>
                <input
                  name="phone"
                  value={address.phone}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  placeholder="1112345678"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="font-bold text-dark text-lg mb-4">Método de pago</h2>
            <div className="space-y-3">
              <label className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-colors ${paymentMethod === 'transfer' ? 'border-primary bg-green-50' : 'border-gray-200'}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="transfer"
                  checked={paymentMethod === 'transfer'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="accent-primary"
                />
                <div>
                  <div className="font-medium text-dark">Transferencia bancaria</div>
                  <div className="text-gray-500 text-xs">Realizá la transferencia y envianos el comprobante</div>
                  <div className="text-gray-500 text-xs">Total: ${total.toLocaleString('es-AR')}</div>
                </div>
              </label>
              <label className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-colors ${paymentMethod === 'mercadopago' ? 'border-primary bg-green-50' : 'border-gray-200'}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="mercadopago"
                  checked={paymentMethod === 'mercadopago'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="accent-primary"
                />
                <div>
                  <div className="font-medium text-dark">Mercado Pago</div>
                  <div className="text-gray-500 text-xs">Tarjeta, cuotas o MP wallet</div>
                  <div className="text-gray-500 text-xs">Total: ${total.toLocaleString('es-AR')}</div>
                </div>
              </label>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60 text-lg"
          >
            {loading ? 'Procesando...' : 'Confirmar pedido'}
          </button>
        </form>

        {/* ─── Resumen del pedido ───────────────────────────────────────── */}
        <div className="w-full md:w-80">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 sticky top-4">
            <h2 className="font-bold text-dark text-lg mb-4">Tu pedido</h2>
            <div className="space-y-3 mb-4">
              {cart.map((item) => (
                <div key={item._id} className="flex justify-between text-sm">
                  <span className="text-gray-600 flex-1 mr-2 line-clamp-1">
                    {item.name} x{item.quantity}
                  </span>
                  <span className="text-dark font-medium">
                    ${(item.price * item.quantity).toLocaleString('es-AR')}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between font-bold text-dark">
                <span>Total</span>
                <span>${total.toLocaleString('es-AR')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;