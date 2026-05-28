// ─── Dependencias ──────────────────────────────────────────────────────────
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ─── Verificar token ───────────────────────────────────────────────────────
// NOTE: este middleware se aplica a cualquier ruta que requiera estar logueado
const verifyToken = async (req, res, next) => {
  try {
    // NOTE: el token viene en el header Authorization: Bearer <token>
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // NOTE: buscar el usuario en la DB para verificar que sigue existiendo
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    // NOTE: adjuntar el usuario al request para usarlo en los controllers
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

// ─── Verificar rol admin ───────────────────────────────────────────────────
// NOTE: siempre usar después de verifyToken, nunca solo
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado — se requiere rol admin' });
  }
  next();
};

// NOTE: verifica el token si existe, pero no bloquea si no hay token
// se usa en rutas publicas que tienen comportamiento diferente para admin
const optionalToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    User.findById(decoded.id).then((user) => {
      if (user) req.user = user;
      next();
    });
  } catch {
    next();
  }
};

module.exports = { verifyToken, requireAdmin, optionalToken };

module.exports = { verifyToken, requireAdmin };