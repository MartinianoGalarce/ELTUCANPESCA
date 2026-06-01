// ─── Dependencias ──────────────────────────────────────────────────────────
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ─── Schema ────────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
    },

    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
    },

    // NOTE: select: false — nunca se devuelve en los GET, hay que pedirlo explícitamente
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
      select: false,
    },

    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },

    address: {
      street:   { type: String, default: '' },
      number:   { type: String, default: '' },
      city:     { type: String, default: '' },
      province: { type: String, default: '' },
      zip:      { type: String, default: '' },
      phone:    { type: String, default: '' },
    },

    // NOTE: verificación de email
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      default: '',
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },

    // NOTE: recuperación de contraseña
    passwordResetToken: {
      type: String,
      default: '',
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
  },
  {
    // NOTE: agrega createdAt y updatedAt automáticamente
    timestamps: true,
  }
);

// ─── Middleware pre-save ────────────────────────────────────────────────────
// NOTE: hashea la contraseña antes de guardar, solo si fue modificada
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// ─── Método de instancia ───────────────────────────────────────────────────
// NOTE: compara la contraseña ingresada con el hash guardado
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);