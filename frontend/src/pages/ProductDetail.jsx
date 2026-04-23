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

  // NOTE: índice de la imagen principal activa
  const [activeImg, setActiveImg] = useState(0);
  // NOTE: lightbox — null = cerrado, número = índice de imagen abierta
  const [lightbox, setLightbox] = useState(null);

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
    setTimeout(() => setAdded(false), 2000);
  };

  // NOTE: navegar entre imágenes en el lightbox con teclado
  useEffect(() => {
    if (lightbox === null || !product) return;
    const handleKey = (e) => {
      if (e.key === 'ArrowRight') setLightbox((i) => (i + 1) % product.images.length);
      if (e.key === 'ArrowLeft') setLightbox((i) => (i - 1 + product.images.length) % product.images.length);
      if (e.key === 'Escape') setLightbox(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightbox, product]);

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12 text-gray-400">Cargando producto...</div>
      </Layout>
    );
  }

  if (!product) return null;

  const images = product.images || [];

  return (
    <Layout>
      {/* ─── Breadcrumb ───────────────────────────────────────────────── */}
      <div className="text-sm text-gray-400 mb-6">
        <span className="hover:text-primary cursor-pointer" onClick={() => navigate('/productos')}>
          Productos
        </span>
        <span className="mx-2">›</span>
        <span className="text-dark">{product.name}</span>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-8 flex flex-col md:flex-row gap-10 md:items-start">

        {/* ─── Galería ──────────────────────────────────────────────────── */}
        <div className="flex-1 flex gap-3 md:max-w-sm lg:max-w-md">

          {/* Miniaturas — solo si hay más de una imagen */}
          {images.length > 1 && (
            <div className="flex flex-col gap-2">
              {images.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImg(idx)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors flex-shrink-0 ${
                    activeImg === idx ? 'border-primary' : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Imagen principal */}
          <div className="flex-1 bg-white border border-gray-200 rounded-xl flex items-center justify-center aspect-square relative">
            {images.length > 0 ? (
              <img
                src={images[activeImg]}
                alt={product.name}
                className="h-full w-full object-contain rounded-xl cursor-zoom-in p-4"
                onClick={() => setLightbox(activeImg)}
              />
            ) : (
              <span className="text-gray-400">Sin imagen</span>
            )}
          </div>
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
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm text-gray-600">Cantidad:</span>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                  >−</button>
                  <span className="px-4 py-2 text-dark font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                  >+</button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className={`w-full py-3 rounded-xl font-bold text-white text-lg transition-colors ${
                  added ? 'bg-green-600' : 'bg-primary hover:bg-primary-dark'
                }`}
              >
                {added ? '¡Agregado al carrito!' : 'Agregar al carrito'}
              </button>
            </>
          )}

          <div className="mt-6 bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
            <div className="font-medium text-dark mb-1">Medios de pago</div>
            <div>Mercado Pago · Transferencia bancaria</div>
            <div className="text-accent font-medium mt-1">
              10% de descuento pagando con transferencia
            </div>
          </div>
        </div>
      </div>

      {/* ─── Lightbox ─────────────────────────────────────────────────────── */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={() => setLightbox(null)}
        >
          <button className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 transition-colors">
            ✕
          </button>

          <img
            src={images[lightbox]}
            alt=""
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setLightbox((i) => (i - 1 + images.length) % images.length); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl transition-colors"
              >
                ‹
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setLightbox((i) => (i + 1) % images.length); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl transition-colors"
              >
                ›
              </button>
            </>
          )}

          {images.length > 1 && (
            <div className="absolute bottom-4 text-white/60 text-sm">
              {lightbox + 1} / {images.length}
            </div>
          )}
        </div>
      )}
    </Layout>
  );
};

export default ProductDetail;