// ─── Dependencias ──────────────────────────────────────────────────────────
const mongoose = require('mongoose');

// ─── Schema de items embebidos ─────────────────────────────────────────────
// NOTE: los items se guardan embebidos con snapshot de precio y nombre
// para preservar el historial aunque el producto cambie de precio después
const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'La cantidad mínima es 1'],
  },
});

// ─── Schema principal ──────────────────────────────────────────────────────
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    items: {
      type: [orderItemSchema],
      required: true,
    },

    total: {
      type: Number,
      required: true,
      min: [0, 'El total no puede ser negativo'],
    },

    // NOTE: máquina de estados — ver arquitectura para las transiciones válidas
    status: {
      type: String,
      enum: [
        'pending',           // orden creada, esperando pago
        'awaiting_payment',  // transferencia elegida, esperando confirmación admin
        'paid',              // pago confirmado
        'preparing',         // local preparando el pedido
        'shipped',           // pedido enviado
        'delivered',         // pedido entregado — estado final exitoso
        'failed',            // pago fallido
        'cancelled',         // orden cancelada
      ],
      default: 'pending',
    },

    paymentMethod: {
      type: String,
      enum: ['mercadopago', 'transfer'],
      required: true,
    },

    // NOTE: ID de transacción de MP — se completa cuando el webhook confirma el pago
    paymentId: {
      type: String,
      default: '',
    },

    // NOTE: snapshot de la dirección al momento de la compra
    // no referenciar User.address porque el usuario puede cambiarla después
    shippingAddress: {
      street:   { type: String, required: true },
      number:   { type: String, required: true },
      city:     { type: String, required: true },
      province: { type: String, required: true },
      zip:      { type: String, required: true },
      phone:    { type: String, required: true },
    },

    // NOTE: URL del comprobante de transferencia subido por el cliente
    transferReceipt: {
      type: String,
      default: '',
    },

    trackingNumber: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Order', orderSchema);