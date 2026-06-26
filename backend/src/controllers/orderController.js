// ─── Dependencias ──────────────────────────────────────────────────────────
const Order = require('../models/Order');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// ─── Crear orden ───────────────────────────────────────────────────────────
// POST /api/orders
const createOrder = async (req, res) => {
  // NOTE: usar sesión de MongoDB para que orden + descuento de stock sean atómicos
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items, paymentMethod, shippingAddress } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'La orden debe tener al menos un producto' });
    }

    // NOTE: verificar stock y construir los items con snapshot de precio
    const orderItems = [];
    let total = 0;

    for (const item of items) {
      const product = await Product.findById(item.product).session(session);

      if (!product || !product.active) {
        await session.abortTransaction();
        return res.status(400).json({ error: `Producto no disponible: ${item.product}` });
      }

      if (product.stock < item.quantity) {
        await session.abortTransaction();
        return res.status(400).json({
          error: `Stock insuficiente para ${product.name}. Disponible: ${product.stock}`,
        });
      }

      // NOTE: descontar stock — se revierte si la transacción falla
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } },
        { session }
      );

      orderItems.push({
        product: product._id,
        name: product.name,       // snapshot del nombre
        price: product.price,     // snapshot del precio al momento de la compra
        quantity: item.quantity,
      });

      total += product.price * item.quantity;
    }

    // NOTE: status inicial según método de pago
    const status = paymentMethod === 'transfer' ? 'awaiting_payment' : 'pending';

    const order = await Order.create(
      [{ user: req.user._id, items: orderItems, total, status, paymentMethod, shippingAddress }],
      { session }
    );

    await session.commitTransaction();

    res.status(201).json(order[0]);
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ error: 'Error al crear la orden' });
  } finally {
    // NOTE: siempre cerrar la sesión al terminar
    session.endSession();
  }
};

// ─── Obtener órdenes del usuario logueado ──────────────────────────────────
// GET /api/orders/my-orders
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener órdenes' });
  }
};

// ─── Obtener una orden por ID ──────────────────────────────────────────────
// GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    // NOTE: el cliente solo puede ver sus propias órdenes — el admin ve todas
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la orden' });
  }
};

// ─── Obtener todas las órdenes (solo admin) ────────────────────────────────
// GET /api/orders
const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = status ? { status } : {};
    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments(filter),
    ]);

    res.json({ orders, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener órdenes' });
  }
};

// ─── Actualizar estado de una orden (solo admin) ───────────────────────────
// PATCH /api/orders/:id/status
const updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber } = req.body;

    // NOTE: transiciones válidas según la máquina de estados definida en la arquitectura
    const validTransitions = {
      pending:          ['paid', 'awaiting_payment', 'failed', 'cancelled'],
      awaiting_payment: ['paid', 'cancelled'],
      paid:             ['preparing', 'cancelled'],
      preparing:        ['shipped', 'cancelled'],
      shipped:          ['delivered', 'cancelled'],
      delivered:        [],
      failed:           [],
      cancelled:        [],
    };

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    if (!validTransitions[order.status].includes(status)) {
      return res.status(400).json({
        error: `Transición inválida: ${order.status} → ${status}`,
      });
    }

    // NOTE: si se cancela, devolver el stock de todos los items
    if (status === 'cancelled') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }
    }

    order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    // NOTE: notificar al cliente por email cuando cambia el estado
    try {
      const { sendOrderStatusEmail } = require('../utils/emails');
      const populatedOrder = await Order.findById(order._id).populate('user', 'name email');
      await sendOrderStatusEmail(
        populatedOrder.user.email,
        populatedOrder.user.name,
        order._id.toString(),
        status
      );
    } catch (emailErr) {
      console.error('Error enviando email de estado:', emailErr.message);
    }
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
};

// ─── Subir comprobante de transferencia ────────────────────────────────────
// POST /api/orders/:id/receipt
const uploadReceipt = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    // NOTE: solo el dueño de la orden puede subir el comprobante
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    if (order.paymentMethod !== 'transfer') {
      return res.status(400).json({ error: 'Esta orden no es por transferencia' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ningún archivo' });
    }

    const cloudinary = require('../config/cloudinary');

    // NOTE: subir buffer a cloudinary sin guardar en disco
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'eltucan/receipts' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    order.transferReceipt = result.secure_url;
    await order.save();

    res.json({ message: 'Comprobante subido correctamente', url: result.secure_url });
  } catch (error) {
    res.status(500).json({ error: 'Error al subir el comprobante' });
  }
};

module.exports = { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus, uploadReceipt };