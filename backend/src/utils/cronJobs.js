// ─── Dependencias ──────────────────────────────────────────────────────────
const cron = require('node-cron');
const Order = require('../models/Order');
const Product = require('../models/Product');

// ─── Cancelar órdenes MP sin pagar después de 30 minutos ──────────────────
const cancelUnpaidOrders = async () => {
  try {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    const unpaidOrders = await Order.find({
      paymentMethod: 'mercadopago',
      status: 'pending',
      createdAt: { $lt: thirtyMinutesAgo },
    });

    for (const order of unpaidOrders) {
      // NOTE: devolver stock de cada item
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }

      order.status = 'cancelled';
      await order.save();

      console.log(`Orden cancelada por falta de pago: ${order._id}`);
    }

    if (unpaidOrders.length > 0) {
      console.log(`${unpaidOrders.length} ordenes canceladas por falta de pago`);
    }
  } catch (error) {
    console.error('Error en cron cancelUnpaidOrders:', error.message);
  }
};

// NOTE: correr cada 15 minutos
const initCronJobs = () => {
  cron.schedule('*/15 * * * *', cancelUnpaidOrders);
  console.log('Cron jobs iniciados');
};

module.exports = { initCronJobs };