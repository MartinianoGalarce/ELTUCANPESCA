// ─── Dependencias ──────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  const [activeImg, setActiveImg] = useState(0);
  const [lightbox, setLightbox] = useState(null);
  const [activeTab, setActiveTab] = useState('descripcion');
  const [related, setRelated] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${slug}`);
        setProduct(res.data);
        // NOTE: traer productos relacionados de la misma categoría
        if (res.data.category?._id) {
          const relRes = await api.get(`/products?category=${res.data.category._id}&limit=4`);
          setRelated(relRes.data.products.filter((p) => p.slug !== slug));
        }
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
      <div className="text-xs text-gray-400 mb-6 uppercase tracking-wide flex items-center gap-2">
        <span className="hover:text-primary cursor-pointer" onClick={() => navigate('/')}>Home</span>
        <span>›</span>
        <span className="hover:text-primary cursor-pointer" onClick={() => navigate('/productos')}>Catálogo</span>
        <span>›</span>
        {product.category?.name && (
          <>
            <span className="hover:text-primary cursor-pointer" onClick={() => navigate(`/productos?category=${product.category._id}`)}>
              {product.category.name}
            </span>
            <span>›</span>
          </>
        )}
        <span className="text-dark">{product.name}</span>
      </div>

      {/* ─── Contenido principal ──────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8 flex flex-col md:flex-row gap-10 md:items-start mb-8">

        {/* ─── Galería ──────────────────────────────────────────────────── */}
        <div className="flex-1 md:max-w-sm lg:max-w-md">

          {/* Imagen principal */}
          <div className="bg-white border border-gray-200 rounded-xl flex items-center justify-center aspect-square relative mb-3">
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

          {/* Miniaturas abajo — solo si hay más de una imagen */}
          {images.length > 1 && (
            <div className="flex gap-2 justify-center">
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
        </div>

        {/* ─── Info ─────────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col">

          {/* Categoría badge */}
          {product.category?.name && (
            <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full mb-3 w-fit uppercase tracking-wide">
              {product.category.name}
            </span>
          )}

          <h1 className="text-2xl font-bold text-dark mb-2">{product.name}</h1>

          {/* Precio */}
          <div className="mb-4">
            <div className="text-3xl font-bold text-accent mb-2">
              ${product.price.toLocaleString('es-AR')}
            </div>
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2 mb-6">
            {product.stock > 0 ? (
              <>
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                <span className="text-sm text-green-600 font-medium">Stock Disponible</span>
                <span className="text-sm text-gray-400">— Quedan {product.stock} unidades</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>
                <span className="text-sm text-red-500 font-medium">Sin stock</span>
              </>
            )}
          </div>
          
          {/* Consultar por WhatsApp */}

        <a  href={`https://wa.me/5492281541007?text=${encodeURIComponent(`Hola! Quería consultar sobre el producto: ${product.name}`)}`}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1 mb-6"
        >
          💬 Consultar por <span className="text-green-600 font-medium">WhatsApp</span> antes de comprar
        </a>
          

          {product.stock > 0 && (
            <>
              {/* Cantidad */}
              <div className="mb-4">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Cantidad</div>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden w-fit">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors text-lg"
                  >−</button>
                  <span className="px-5 py-2 text-dark font-medium border-x border-gray-300">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors text-lg"
                  >+</button>
                </div>
              </div>

              {/* Botón agregar */}
              <button
                onClick={handleAddToCart}
                className={`w-full py-3 rounded-xl font-bold text-white text-lg transition-colors mb-4 flex items-center justify-center gap-2 ${
                  added ? 'bg-green-600' : 'bg-primary hover:bg-primary-dark'
                }`}
              >
                {added ? (
                  '¡Agregado al carrito!'
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Agregar al carrito
                  </>
                )}
              </button>
            </>
          )}

          {/* Beneficios */}
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
              <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1 10a2 2 0 002 2h8a2 2 0 002-2L19 8" />
              </svg>
              <div>
                <div className="text-xs font-semibold text-dark">Envíos Rápidos</div>
                <div className="text-xs text-gray-400">A todo el país</div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
              <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div>
                <div className="text-xs font-semibold text-dark">Garantía Oficial</div>
                <div className="text-xs text-gray-400">12 meses de fábrica</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Tabs ─────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-2xl mb-8">
        <div className="flex border-b border-gray-200">
          {['descripcion', 'envios'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-dark'
              }`}
            >
              {tab === 'descripcion' ? 'Descripción' : 'Envíos y Devoluciones'}
            </button>
          ))}
        </div>
        <div className="p-6 text-sm text-gray-600 leading-relaxed">
          {activeTab === 'descripcion' && (
            product.description
              ? <p>{product.description}</p>
              : <p className="text-gray-400">Este producto no tiene descripción.</p>
          )}
          {activeTab === 'envios' && (
            <div className="space-y-3">
              <p>Realizamos envíos a todo el país a través de correo privado.</p>
              <p>El tiempo de entrega estimado es de 3 a 7 días hábiles según la zona.</p>
              <p>Para devoluciones o cambios, contactanos por Instagram <strong>@eltucanpesca</strong> dentro de los 30 días de recibido el producto.</p>
            </div>
          )}
        </div>
      </div>

      {/* ─── Productos relacionados ───────────────────────────────────────── */}
      {related.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-dark">Productos Relacionados</h2>
            <Link to="/productos" className="text-sm text-primary hover:text-primary-dark transition-colors">
              Ver catálogo completo →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.slice(0, 4).map((p) => (
              <Link
                key={p._id}
                to={`/productos/${p.slug}`}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all group"
              >
                <div className="h-36 bg-gray-100 relative">
                  {p.images?.[0] ? (
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 text-xs">Sin imagen</div>
                  )}
                  {p.category?.name && (
                    <span className="absolute top-2 left-2 bg-primary text-white text-xs font-semibold px-2 py-0.5 rounded uppercase tracking-wide">
                      {p.category.name}
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <div className="text-xs font-medium text-dark line-clamp-2 mb-1">{p.name}</div>
                  <div className="text-accent font-bold text-sm">${p.price.toLocaleString('es-AR')}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ─── Lightbox ─────────────────────────────────────────────────────── */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={() => setLightbox(null)}
        >
          <button className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 transition-colors">✕</button>
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
              >‹</button>
              <button
                onClick={(e) => { e.stopPropagation(); setLightbox((i) => (i + 1) % images.length); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl transition-colors"
              >›</button>
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