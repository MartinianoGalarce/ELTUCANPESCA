// ─── Dependencias ──────────────────────────────────────────────────────────
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/emails');

// ─── Helper — generar JWT ──────────────────────────────────────────────────
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// ─── Helper — generar token aleatorio ─────────────────────────────────────
const generateRandomToken = () => crypto.randomBytes(32).toString('hex');

// ─── Registro ──────────────────────────────────────────────────────────────
// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const verificationToken = generateRandomToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24hs

    const user = await User.create({
      name,
      email,
      password,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    });

    // NOTE: enviar email de verificación — si falla no bloqueamos el registro
    try {
      await sendVerificationEmail(email, name, verificationToken);
    } catch (emailErr) {
      console.error('Error enviando email de verificación:', emailErr.message);
    }

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar usuario', detail: error.message });
  }
};

// ─── Verificar email ───────────────────────────────────────────────────────
// GET /api/auth/verify-email?token=xxx
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    }).select('+emailVerificationToken +emailVerificationExpires');

    if (!user) {
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = '';
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({ message: 'Email verificado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al verificar email', detail: error.message });
  }
};

// ─── Login ─────────────────────────────────────────────────────────────────
// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al iniciar sesión', detail: error.message });
  }
};

// ─── Perfil propio ─────────────────────────────────────────────────────────
// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    res.json({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      address: req.user.address,
      isEmailVerified: req.user.isEmailVerified,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener perfil', detail: error.message });
  }
};

// ─── Actualizar perfil ─────────────────────────────────────────────────────
// PATCH /api/auth/me
const updateMe = async (req, res) => {
  try {
    const { name, address } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { name, address },
      { new: true, runValidators: true }
    );

    res.json({
      id: updated._id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      address: updated.address,
      isEmailVerified: updated.isEmailVerified,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar perfil', detail: error.message });
  }
};

// ─── Olvidé mi contraseña ──────────────────────────────────────────────────
// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    // NOTE: siempre responder 200 aunque no exista el email — no revelar si está registrado
    if (!user) {
      return res.json({ message: 'Si el email existe recibirás un link para resetear tu contraseña' });
    }

    const resetToken = generateRandomToken();
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
    await user.save();

    try {
      await sendPasswordResetEmail(email, user.name, resetToken);
    } catch (emailErr) {
      console.error('Error enviando email de reset:', emailErr.message);
    }

    res.json({ message: 'Si el email existe recibirás un link para resetear tu contraseña' });
  } catch (error) {
    res.status(500).json({ error: 'Error al procesar la solicitud', detail: error.message });
  }
};

// ─── Resetear contraseña ───────────────────────────────────────────────────
// POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }

    user.password = password;
    user.passwordResetToken = '';
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al resetear contraseña', detail: error.message });
  }
};

module.exports = { register, login, getMe, updateMe, verifyEmail, forgotPassword, resetPassword };