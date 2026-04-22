// ─── Dependencias ──────────────────────────────────────────────────────────
const mongoose = require('mongoose');

// ─── Schema ────────────────────────────────────────────────────────────────
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      unique: true,
    },

    // NOTE: slug es la versión URL-friendly del nombre — ej: "Cañas de Pesca" → "canas-de-pesca"
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      default: '',
      trim: true,
    },

    image: {
      type: String,
      default: '',
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

// ─── Middleware pre-save ────────────────────────────────────────────────────
// NOTE: genera el slug automáticamente desde el nombre si no fue provisto
categorySchema.pre('save', async function () {
  if (!this.isModified('name')) return;
  this.slug = this.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // NOTE: elimina tildes — "pesca" en lugar de "pesca"
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
});

module.exports = mongoose.model('Category', categorySchema);