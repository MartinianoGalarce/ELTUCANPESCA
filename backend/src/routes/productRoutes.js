// ─── Dependencias ──────────────────────────────────────────────────────────
const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { verifyToken, requireAdmin, optionalToken } = require('../middlewares/authMiddleware');

// ─── Rutas públicas ────────────────────────────────────────────────────────
router.get('/', optionalToken, getProducts);
router.get('/:slug', getProductBySlug);

// ─── Rutas privadas (solo admin) ───────────────────────────────────────────
router.get('/admin/:id', verifyToken, requireAdmin, getProductById);
router.post('/', verifyToken, requireAdmin, createProduct);
router.patch('/:id', verifyToken, requireAdmin, updateProduct);
router.delete('/:id', verifyToken, requireAdmin, deleteProduct);

module.exports = router;