// ─── Dependencias ──────────────────────────────────────────────────────────
const express = require('express');
const router = express.Router();
const { verifyToken, requireAdmin } = require('../middlewares/authMiddleware');
const SiteSettings = require('../models/SiteSettings');

// ─── GET /api/settings/banner ──────────────────────────────────────────────
// NOTE: pública — el Navbar la llama sin auth para obtener los mensajes
router.get('/banner', async (req, res) => {
  try {
    const settings = await SiteSettings.findOne({ key: 'banner' });

    // NOTE: si no existe el documento todavía, devolvemos defaults
    if (!settings) {
      return res.json({
        messages: ['Envíos a todo el país', 'Retiro en Tapalque'],
        active: true,
      });
    }

    res.json({ messages: settings.messages, active: settings.active });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener configuración del banner' });
  }
});

// ─── PUT /api/settings/banner ──────────────────────────────────────────────
// NOTE: solo admin — reemplaza los mensajes del banner
router.put('/banner', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { messages, active } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages debe ser un array con al menos un mensaje' });
    }

    if (messages.length > 5) {
      return res.status(400).json({ error: 'Máximo 5 mensajes permitidos' });
    }

    // NOTE: findOneAndUpdate con upsert — crea el documento si no existe
    const settings = await SiteSettings.findOneAndUpdate(
      { key: 'banner' },
      { messages, active: active ?? true },
      { upsert: true, new: true }
    );

    res.json({ message: 'Banner actualizado', data: settings });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el banner' });
  }
});

module.exports = router;