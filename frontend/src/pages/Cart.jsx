// ─── Dependencias ──────────────────────────────────────────────────────────
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
  const { cart, total, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      navigate('/login?redirect=/checkout');
      return;
    }
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <Layout>
        <div className="text-center py-20">
          <div className="text-6xl mb-6">🎣</div>
          <h2 className="text-2xl font-bold text-dark mb-4">Tu carrito está vacío</h2>
          <p className="text-gray-500 mb-8">Agregá productos para continuar</p>
          <Link
            to="/productos"
            className="bg-primary hover:bg-primary-dark text-white font-bold px-8 py-3 rounded-xl transition-colors"
          >
            Ver productos
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-dark mb-8">Tu carrito</h1>

      <div className="flex flex-col md:flex-row gap-8">

        {/* ─── Lista de items ───────────────────────────────────────────── */}
        <div className="flex-1 space-y-4">
          {cart.map((item) => (
            <div
              key={item._id}
              className="bg-white border border-gray-200 rounded-xl p-4 flex gap-4 items-center"
            >
              {/* ─── Imagen ─────────────────────────────────────────── */}
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                {item.images?.[0] ? (
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <span className="text-gray-400 text-xs">Sin imagen</span>
                )}
              </div>

              {/* ─── Info ───────────────────────────────────────────── */}
              <div className="flex-1">
                <div className="font-medium text-dark text-sm mb-1">{item.name}</div>
                <div className="text-accent font-bold">
                  ${item.price.toLocaleString('es-AR')}
                </div>
              </div>

              {/* ─── Cantidad ───────────────────────────────────────── */}
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => updateQuantity(item._id, item.quantity - 1)}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  −
                </button>
                <span className="px-3 py-2 text-dark font-medium text-sm">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item._id, item.quantity + 1)}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  +
                </button>
              </div>

              {/* ─── Subtotal ───────────────────────────────────────── */}
              <div className="text-dark font-bold w-24 text-right text-sm">
                ${(item.price * item.quantity).toLocaleString('es-AR')}
              </div>

              {/* ─── Eliminar ───────────────────────────────────────── */}
              <button
                onClick={() => removeFromCart(item._id)}
                className="text-gray-400 hover:text-red-500 transition-colors ml-2"
              >
                ✕
              </button>
            </div>
          ))}

          {/* ─── Vaciar carrito ───────────────────────────────────────── */}
          <button
            onClick={clearCart}
            className="text-sm text-gray-400 hover:text-red-500 transition-colors"
          >
            Vaciar carrito
          </button>
        </div>

        {/* ─── Resumen ──────────────────────────────────────────────────── */}
        <div className="w-full md:w-80">
          <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-4">
            <h2 className="font-bold text-dark text-lg mb-6">Resumen</h2>

            <div className="space-y-3 mb-6 text-sm">
              {cart.map((item) => (
                <div key={item._id} className="flex justify-between text-gray-600">
                  <span className="line-clamp-1 flex-1 mr-2">{item.name} x{item.quantity}</span>
                  <span>${(item.price * item.quantity).toLocaleString('es-AR')}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex justify-between font-bold text-dark text-lg">
                <span>Total</span>
                <span>${total.toLocaleString('es-AR')}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl transition-colors"
            >
              Finalizar compra
            </button>

            <Link
              to="/productos"
              className="block text-center text-sm text-gray-500 hover:text-primary mt-4 transition-colors"
            >
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Cart;