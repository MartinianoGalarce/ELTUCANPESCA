// ─── Dependencias ──────────────────────────────────────────────────────────
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ─── Helper — generar JWT ──────────────────────────────────────────────────
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// ─── Registro ──────────────────────────────────────────────────────────────
// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // NOTE: verificar si el email ya está registrado antes de intentar crear
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar usuario', detail: error.message });
  }
};

// ─── Login ─────────────────────────────────────────────────────────────────
// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // NOTE: select('+password') porque el campo tiene select: false en el schema
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // NOTE: mismo mensaje que "usuario no encontrado" — no revelar cuál falló
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
    // NOTE: req.user viene del middleware verifyToken, no hace falta buscar de nuevo
    res.json({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      address: req.user.address,
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

    // NOTE: solo permitir actualizar name y address — nunca email, password ni role desde acá
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
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar perfil', detail: error.message });
  }
};

module.exports = { register, login, getMe, updateMe };