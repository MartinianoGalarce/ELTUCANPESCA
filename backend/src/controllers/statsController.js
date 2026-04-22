// ─── Dependencias ──────────────────────────────────────────────────────────
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// ─── Resumen de ventas ─────────────────────────────────────────────────────
// GET /api/stats/sales/summary
const getSalesSummary = async (req, res) => {
  try {
    const { from, to } = req.query;
    const filter = { status: { $in: ['paid', 'preparing', 'shipped', 'delivered'] } };

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    const result = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          totalOrders: { $count: {} },
          avgTicket: { $avg: '$total' },
        },
      },
    ]);

    res.json(
      result[0] || { totalRevenue: 0, totalOrders: 0, avgTicket: 0 }
    );
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener resumen', detail: error.message });
  }
};

// ─── Ventas por día ────────────────────────────────────────────────────────
// GET /api/stats/sales/by-day
const getSalesByDay = async (req, res) => {
  try {
    const { from, to } = req.query;
    const filter = { status: { $in: ['paid', 'preparing', 'shipped', 'delivered'] } };

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    const result = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $count: {} },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener ventas por día', detail: error.message });
  }
};

// ─── Ventas por método de pago ─────────────────────────────────────────────
// GET /api/stats/sales/by-method
const getSalesByMethod = async (req, res) => {
  try {
    const { from, to } = req.query;
    const filter = { status: { $in: ['paid', 'preparing', 'shipped', 'delivered'] } };

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    const result = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$paymentMethod',
          revenue: { $sum: '$total' },
          orders: { $count: {} },
        },
      },
    ]);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener ventas por método', detail: error.message });
  }
};

// ─── Productos más vendidos ────────────────────────────────────────────────
// GET /api/stats/products/top-selling
const getTopSellingProducts = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 10;

    const result = await Order.aggregate([
      { $match: { status: { $in: ['paid', 'preparing', 'shipped', 'delivered'] } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: limit },
    ]);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos más vendidos', detail: error.message });
  }
};

// ─── Productos con stock bajo ──────────────────────────────────────────────
// GET /api/stats/products/low-stock
const getLowStockProducts = async (req, res) => {
  try {
    const threshold = Number(req.query.threshold) || 5;

    // NOTE: .select('+cost') para incluir el costo en la respuesta del admin
    const products = await Product.find({ stock: { $lte: threshold }, active: true })
      .select('+cost')
      .populate('category', 'name')
      .sort({ stock: 1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos con stock bajo', detail: error.message });
  }
};

// ─── Valor total del inventario ────────────────────────────────────────────
// GET /api/stats/products/inventory-value
const getInventoryValue = async (req, res) => {
  try {
    // NOTE: Σ(stock × cost) — requiere select('+cost') porque cost tiene select: false
    const result = await Product.aggregate([
      { $match: { active: true } },
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ['$stock', '$cost'] } },
          totalProducts: { $count: {} },
          totalStock: { $sum: '$stock' },
        },
      },
    ]);

    res.json(result[0] || { totalValue: 0, totalProducts: 0, totalStock: 0 });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener valor del inventario', detail: error.message });
  }
};

// ─── Órdenes por estado ────────────────────────────────────────────────────
// GET /api/stats/orders/by-status
const getOrdersByStatus = async (req, res) => {
  try {
    const result = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $count: {} },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener órdenes por estado', detail: error.message });
  }
};

// ─── Órdenes recientes ─────────────────────────────────────────────────────
// GET /api/stats/orders/recent
const getRecentOrders = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 10;

    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener órdenes recientes', detail: error.message });
  }
};

// ─── Clientes que más compraron ────────────────────────────────────────────
// GET /api/stats/customers/top
const getTopCustomers = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 10;

    const result = await Order.aggregate([
      { $match: { status: { $in: ['paid', 'preparing', 'shipped', 'delivered'] } } },
      {
        $group: {
          _id: '$user',
          totalSpent: { $sum: '$total' },
          totalOrders: { $count: {} },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          totalSpent: 1,
          totalOrders: 1,
          'user.name': 1,
          'user.email': 1,
        },
      },
    ]);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener top clientes', detail: error.message });
  }
};

// ─── Nuevos clientes por período ───────────────────────────────────────────
// GET /api/stats/customers/new
const getNewCustomers = async (req, res) => {
  try {
    const { from, to } = req.query;
    const filter = {};

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    const result = await User.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          newUsers: { $count: {} },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener nuevos clientes', detail: error.message });
  }
};

module.exports = {
  getSalesSummary,
  getSalesByDay,
  getSalesByMethod,
  getTopSellingProducts,
  getLowStockProducts,
  getInventoryValue,
  getOrdersByStatus,
  getRecentOrders,
  getTopCustomers,
  getNewCustomers,
};