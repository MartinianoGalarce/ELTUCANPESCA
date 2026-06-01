// ─── Dependencias ──────────────────────────────────────────────────────────
const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  uploadReceipt,
} = require('../controllers/orderController');
const { verifyToken, requireAdmin } = require('../middlewares/authMiddleware');

// NOTE: multer en memoria — el buffer se pasa directo a cloudinary
const upload = multer({ storage: multer.memoryStorage() });

// ─── Rutas privadas (usuario logueado) ─────────────────────────────────────
router.post('/', verifyToken, createOrder);
router.get('/my-orders', verifyToken, getMyOrders);
router.get('/:id', verifyToken, getOrderById);
router.post('/:id/receipt', verifyToken, upload.single('receipt'), uploadReceipt);

// ─── Rutas privadas (solo admin) ───────────────────────────────────────────
router.get('/', verifyToken, requireAdmin, getAllOrders);
router.patch('/:id/status', verifyToken, requireAdmin, updateOrderStatus);

module.exports = router;