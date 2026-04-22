// ─── Dependencias ──────────────────────────────────────────────────────────
const express = require('express');
const router = express.Router();
const { register, login, getMe, updateMe } = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');

// ─── Rutas públicas ────────────────────────────────────────────────────────
router.post('/register', register);
router.post('/login', login);

// ─── Rutas privadas (requieren token) ─────────────────────────────────────
router.get('/me', verifyToken, getMe);
router.patch('/me', verifyToken, updateMe);

module.exports = router;