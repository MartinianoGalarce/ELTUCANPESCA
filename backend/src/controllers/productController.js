// ─── Dependencias ──────────────────────────────────────────────────────────
const Product = require('../models/Product');

// ─── Obtener todos los productos ───────────────────────────────────────────
// GET /api/products
const getProducts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12, sort, minPrice, maxPrice } = req.query;

    const filter = {};

    if (req.user?.role !== 'admin') filter.active = true;
    if (category) filter.category = category;
    if (search) filter.$text = { $search: search };

    // NOTE: rango de precio
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // NOTE: ordenamiento — default más nuevo primero
    const sortOptions = {
      newest:     { createdAt: -1 },
      price_asc:  { price: 1 },
      price_desc: { price: -1 },
    };
    const sortQuery = sortOptions[sort] || sortOptions.newest;

    const skip = (Number(page) - 1) * Number(limit);

    const select = req.user?.role === 'admin' ? '+cost' : '-cost';

    const [products, total] = await Promise.all([
      Product.find(filter)
        .select(select)
        .populate('category', 'name slug')
        .sort(sortQuery)
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(filter),
    ]);

    res.json({
      products,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos', detail: error.message });
  }
};

// ─── Obtener un producto por slug ──────────────────────────────────────────
// GET /api/products/:slug
const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({
      slug: req.params.slug,
      active: true,
    }).populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener producto', detail: error.message });
  }
};

// ─── Obtener un producto por ID (solo admin) ───────────────────────────────
// GET /api/products/admin/:id
const getProductById = async (req, res) => {
  try {
    // NOTE: .select('+cost') porque cost tiene select: false en el schema
    const product = await Product.findById(req.params.id)
      .select('+cost')
      .populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener producto', detail: error.message });
  }
};

// ─── Crear producto (solo admin) ───────────────────────────────────────────
// POST /api/products
const createProduct = async (req, res) => {
  try {
    const { category, name, description, price, cost, stock, images } = req.body;
    const product = await Product.create({
      category,
      name,
      description,
      price,
      cost,
      stock,
      images,
    });

    res.status(201).json(product);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Ya existe un producto con ese nombre' });
    }
    res.status(500).json({ error: 'Error al crear producto', detail: error.message });
  }
};

// ─── Actualizar producto (solo admin) ─────────────────────────────────────
// PATCH /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const { category, name, description, price, cost, stock, images, active } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { category, name, description, price, cost, stock, images, active },
      { new: true, runValidators: true }
    ).select('+cost').populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(product);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Ya existe un producto con ese nombre' });
    }
    res.status(500).json({ error: 'Error al actualizar producto', detail: error.message });
  }
};

// ─── Eliminar producto (solo admin) ───────────────────────────────────────
// DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar producto', detail: error.message });
  }
};

module.exports = {
  getProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};