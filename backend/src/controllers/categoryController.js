// ─── Dependencias ──────────────────────────────────────────────────────────
const Category = require('../models/Category');
const cloudinary = require('../config/cloudinary');

// ─── Helper: subir imagen a Cloudinary ─────────────────────────────────────
const uploadImage = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'eltucan/categories' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });

// ─── Obtener todas las categorías ─────────────────────────────────────────
// GET /api/categories
const getCategories = async (req, res) => {
  try {
    const filter = req.user?.role === 'admin' ? {} : { active: true };
    const categories = await Category.find(filter).sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener categorías', detail: error.message });
  }
};

// ─── Obtener una categoría por slug ────────────────────────────────────────
// GET /api/categories/:slug
const getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug, active: true });
    if (!category) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener categoría', detail: error.message });
  }
};

// ─── Crear categoría (solo admin) ──────────────────────────────────────────
// POST /api/categories
const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    let image = '';
    if (req.file) {
      image = await uploadImage(req.file.buffer);
    }
    const category = await Category.create({ name, description, image });
    res.status(201).json(category);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Ya existe una categoría con ese nombre' });
    }
    res.status(500).json({ error: 'Error al crear categoría', detail: error.message });
  }
};

// ─── Actualizar categoría (solo admin) ────────────────────────────────────
// PATCH /api/categories/:id
const updateCategory = async (req, res) => {
  try {
    const { name, description, active } = req.body;
    const update = { name, description, active };

    // NOTE: solo actualizar imagen si se subió una nueva
    if (req.file) {
      update.image = await uploadImage(req.file.buffer);
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    );
    if (!category) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    res.json(category);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Ya existe una categoría con ese nombre' });
    }
    res.status(500).json({ error: 'Error al actualizar categoría', detail: error.message });
  }
};

// ─── Eliminar categoría (solo admin) ──────────────────────────────────────
// DELETE /api/categories/:id
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    res.json({ message: 'Categoría eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar categoría', detail: error.message });
  }
};

module.exports = { getCategories, getCategoryBySlug, createCategory, updateCategory, deleteCategory };