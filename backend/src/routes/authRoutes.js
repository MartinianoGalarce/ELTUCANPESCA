// ─── Dependencias ──────────────────────────────────────────────────────────
const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateMe,
  verifyEmail,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');

// ─── Rutas públicas ────────────────────────────────────────────────────────
router.post('/register', register);
router.post('/login', login);
router.get('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// ─── Rutas privadas (requieren token) ─────────────────────────────────────
router.get('/me', verifyToken, getMe);
router.patch('/me', verifyToken, updateMe);

module.exports = router;