// ─── Dependencias ──────────────────────────────────────────────────────────
const mongoose = require('mongoose');

// ─── Schema ────────────────────────────────────────────────────────────────
const productSchema = new mongoose.Schema(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'La categoría es obligatoria'],
    },

    name: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
    },

    // NOTE: slug generado automáticamente desde el nombre — usado en las URLs
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

    price: {
      type: Number,
      required: [true, 'El precio es obligatorio'],
      min: [0, 'El precio no puede ser negativo'],
    },

    // NOTE: select: false — el costo nunca se devuelve en respuestas públicas
    cost: {
      type: Number,
      default: 0,
      min: [0, 'El costo no puede ser negativo'],
      select: false,
    },

    stock: {
      type: Number,
      default: 0,
      min: [0, 'El stock no puede ser negativo'],
    },

    // NOTE: array de URLs de Cloudinary
    images: {
      type: [String],
      default: [],
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
// NOTE: genera el slug automáticamente desde el nombre si fue modificado
productSchema.pre('save', async function () {
  if (!this.isModified('name')) return;
  this.slug = this.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
});

// ─── Índices ───────────────────────────────────────────────────────────────
// NOTE: índice de texto para búsqueda por nombre y descripción
productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);