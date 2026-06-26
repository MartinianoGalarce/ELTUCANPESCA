// ─── Dependencias ──────────────────────────────────────────────────────────
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// ─── Configuración de variables de entorno ─────────────────────────────────
dotenv.config();

const app = express();

// NOTE: necesario en Render — el proxy de Render agrega el header X-Forwarded-For
app.set('trust proxy', 1);

// ─── Middlewares de seguridad ──────────────────────────────────────────────

// NOTE: helmet setea headers HTTP seguros automáticamente
app.use(helmet());

// NOTE: solo el frontend puede hacer requests al backend en producción
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));

// NOTE: parsear JSON en el body de los requests
app.use(express.json());

// ─── Sanitización NoSQL manual ─────────────────────────────────────────────
app.use((req, res, next) => {
  const sanitize = (obj) => {
    if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach(key => {
        if (key.startsWith('$')) {
          delete obj[key];
        } else {
          sanitize(obj[key]);
        }
      });
    }
  };
  if (req.body) sanitize(req.body);
  next();
});

// NOTE: límite general — 100 requests por IP cada 15 minutos
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  // NOTE: en desarrollo subimos el límite para no bloquearnos mientras probamos
  max: process.env.NODE_ENV === 'development' ? 1000 : 100,
  message: { error: 'Demasiadas solicitudes, intentá de nuevo en 15 minutos.' },
});
app.use('/api', generalLimiter);

// NOTE: límite estricto para login — 10 intentos por IP cada 15 minutos
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 100 : 50,
  message: { error: 'Demasiados intentos de login, intentá de nuevo en 15 minutos.' },
});
app.use('/api/auth/login', authLimiter);

// ─── Rutas ─────────────────────────────────────────────────────────────────
const authRoutes = require('./routes/authRoutes');

app.get('/', (req, res) => {
  res.json({ message: 'El Tucan Pesca API funcionando' });
});

app.use('/api/auth', authRoutes);

const categoryRoutes = require('./routes/categoryRoutes');
app.use('/api/categories', categoryRoutes);

const productRoutes = require('./routes/productRoutes');
app.use('/api/products', productRoutes);

const orderRoutes = require('./routes/orderRoutes');
app.use('/api/orders', orderRoutes);

const statsRoutes = require('./routes/statsRoutes');
app.use('/api/stats', statsRoutes);

const uploadRoutes = require('./routes/uploadRoutes');
app.use('/api/upload', uploadRoutes);

const settingsRoutes = require('./routes/settingsRoutes');
app.use('/api/settings', settingsRoutes);

const paymentRoutes = require('./routes/paymentRoutes');
app.use('/api/payments', paymentRoutes);

const { initCronJobs } = require('./utils/cronJobs');

// ─── Conexión a MongoDB Atlas ──────────────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB conectado');
    initCronJobs();
    app.listen(process.env.PORT, () => {
      console.log(`Servidor corriendo en puerto ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error conectando a MongoDB:', err.message);
    // NOTE: si no hay DB, no tiene sentido levantar el servidor
    process.exit(1);
  });