// ─── Dependencias ──────────────────────────────────────────────────────────
const Category = require('../models/Category');

// ─── Obtener todas las categorías ─────────────────────────────────────────
// GET /api/categories
const getCategories = async (req, res) => {
  try {
    // NOTE: la tienda pública solo ve categorías activas, el admin ve todas
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
    const { name, description, image } = req.body;
    const category = await Category.create({ name, description, image });
    res.status(201).json(category);
  } catch (error) {
    // NOTE: código 11000 = duplicate key — nombre o slug ya existe
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
    const { name, description, image, active } = req.body;
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description, image, active },
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
    // NOTE: en el futuro validar que no tenga productos asociados antes de eliminar
    res.json({ message: 'Categoría eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar categoría', detail: error.message });
  }
};

module.exports = { getCategories, getCategoryBySlug, createCategory, updateCategory, deleteCategory };