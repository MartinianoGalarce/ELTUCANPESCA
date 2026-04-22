// ─── Dependencias ──────────────────────────────────────────────────────────
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');

// ─── Configuración de variables de entorno ─────────────────────────────────
dotenv.config();

const app = express();

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

// NOTE: previene inyección NoSQL limpiando $ y . de los inputs
app.use(mongoSanitize());

// NOTE: límite general — 100 requests por IP cada 15 minutos
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Demasiadas solicitudes, intentá de nuevo en 15 minutos.' },
});
app.use('/api', generalLimiter);

// NOTE: límite estricto para login — 10 intentos por IP cada 15 minutos
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Demasiados intentos de login, intentá de nuevo en 15 minutos.' },
});
app.use('/api/auth/login', authLimiter);

// ─── Rutas ─────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'El Tucan Pesca API funcionando' });
});

// ─── Conexión a MongoDB Atlas ──────────────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB conectado');
    app.listen(process.env.PORT, () => {
      console.log(`Servidor corriendo en puerto ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error conectando a MongoDB:', err.message);
    // NOTE: si no hay DB, no tiene sentido levantar el servidor
    process.exit(1);
  });