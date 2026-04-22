// ─── Dependencias ──────────────────────────────────────────────────────────
const express = require('express');
const router = express.Router();
const {
  getSalesSummary,
  getSalesByDay,
  getSalesByMethod,
  getTopSellingProducts,
  getLowStockProducts,
  getInventoryValue,
  getOrdersByStatus,
  getRecentOrders,
  getTopCustomers,
  getNewCustomers,
} = require('../controllers/statsController');
const { verifyToken, requireAdmin } = require('../middlewares/authMiddleware');

// NOTE: todos los endpoints de stats son solo para admin
router.use(verifyToken, requireAdmin);

// ─── Ventas ────────────────────────────────────────────────────────────────
router.get('/sales/summary', getSalesSummary);
router.get('/sales/by-day', getSalesByDay);
router.get('/sales/by-method', getSalesByMethod);

// ─── Productos ─────────────────────────────────────────────────────────────
router.get('/products/top-selling', getTopSellingProducts);
router.get('/products/low-stock', getLowStockProducts);
router.get('/products/inventory-value', getInventoryValue);

// ─── Órdenes ───────────────────────────────────────────────────────────────
router.get('/orders/by-status', getOrdersByStatus);
router.get('/orders/recent', getRecentOrders);

// ─── Clientes ──────────────────────────────────────────────────────────────
router.get('/customers/top', getTopCustomers);
router.get('/customers/new', getNewCustomers);

module.exports = router;