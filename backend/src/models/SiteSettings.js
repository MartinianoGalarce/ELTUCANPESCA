// ─── Dependencias ──────────────────────────────────────────────────────────
const mongoose = require('mongoose');

// ─── Schema ────────────────────────────────────────────────────────────────
// NOTE: colección singleton — siempre hay un solo documento con key "banner"
const siteSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // NOTE: array de mensajes para la barra promocional — máximo 5
    messages: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 5,
        message: 'Máximo 5 mensajes permitidos',
      },
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);