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
  changePassword,
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
router.patch('/change-password', verifyToken, changePassword);

module.exports = router;