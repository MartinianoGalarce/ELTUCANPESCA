// ─── Dependencias ──────────────────────────────────────────────────────────
const express = require('express');
const router = express.Router();
const { createPreference, handleWebhook } = require('../controllers/paymentController');
const { verifyToken } = require('../middlewares/authMiddleware');

// NOTE: crear preferencia de pago — requiere usuario logueado
router.post('/create-preference/:orderId', verifyToken, createPreference);

// NOTE: webhook de MP — público, MP lo llama directamente
router.post('/webhook', handleWebhook);

module.exports = router;