// ─── Dependencias ──────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/layout/Layout';
import { useCart } from '../context/CartContext';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${slug}`);
        setProduct(res.data);
      } catch (error) {
        navigate('/productos');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    // NOTE: resetear el mensaje de confirmación después de 2 segundos
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12 text-gray-400">Cargando producto...</div>
      </Layout>
    );
  }

  if (!product) return null;

  return (
    <Layout>
      {/* ─── Breadcrumb ───────────────────────────────────────────────── */}
      <div className="text-sm text-gray-400 mb-6">
        <span
          className="hover:text-primary cursor-pointer"
          onClick={() => navigate('/productos')}
        >
          Productos
        </span>
        <span className="mx-2">›</span>
        <span className="text-dark">{product.name}</span>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-8 flex flex-col md:flex-row gap-10">

        {/* ─── Imagen ───────────────────────────────────────────────────── */}
        <div className="flex-1 bg-gray-100 rounded-xl flex items-center justify-center min-h-72">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-72 w-full object-contain rounded-xl"
            />
          ) : (
            <span className="text-gray-400">Sin imagen</span>
          )}
        </div>

        {/* ─── Info ─────────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col">
          <div className="text-sm text-primary font-medium mb-2">
            {product.category?.name}
          </div>
          <h1 className="text-2xl font-bold text-dark mb-4">{product.name}</h1>
          <div className="text-3xl font-bold text-accent mb-6">
            ${product.price.toLocaleString('es-AR')}
          </div>

          {product.description && (
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              {product.description}
            </p>
          )}

          {/* ─── Stock ──────────────────────────────────────────────────── */}
          <div className="text-sm mb-6">
            {product.stock > 0 ? (
              <span className="text-green-600 font-medium">
                Stock disponible: {product.stock} unidades
              </span>
            ) : (
              <span className="text-red-500 font-medium">Sin stock</span>
            )}
          </div>

          {product.stock > 0 && (
            <>
              {/* ─── Cantidad ─────────────────────────────────────────── */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm text-gray-600">Cantidad:</span>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    −
                  </button>
                  <span className="px-4 py-2 text-dark font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* ─── Botón agregar al carrito ─────────────────────────── */}
              <button
                onClick={handleAddToCart}
                className={`w-full py-3 rounded-xl font-bold text-white text-lg transition-colors ${added ? 'bg-green-600' : 'bg-primary hover:bg-primary-dark'}`}
              >
                {added ? '¡Agregado al carrito!' : 'Agregar al carrito'}
              </button>
            </>
          )}

          {/* ─── Info de envío ────────────────────────────────────────── */}
          <div className="mt-6 bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
            <div className="font-medium text-dark mb-1">Medios de pago</div>
            <div>Mercado Pago · Transferencia bancaria</div>
            <div className="text-accent font-medium mt-1">
              10% de descuento pagando con transferencia
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;