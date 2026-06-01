// ─── Dependencias ──────────────────────────────────────────────────────────
const express = require('express');
const multer = require('multer');
const router = express.Router();
const {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { verifyToken, requireAdmin } = require('../middlewares/authMiddleware');

// NOTE: multer en memoria — el buffer se pasa directo a cloudinary
const upload = multer({ storage: multer.memoryStorage() });

// ─── Rutas públicas ────────────────────────────────────────────────────────
router.get('/', getCategories);
router.get('/:slug', getCategoryBySlug);

// ─── Rutas privadas (solo admin) ───────────────────────────────────────────
router.post('/', verifyToken, requireAdmin, upload.single('image'), createCategory);
router.patch('/:id', verifyToken, requireAdmin, upload.single('image'), updateCategory);
router.delete('/:id', verifyToken, requireAdmin, deleteCategory);

module.exports = router;