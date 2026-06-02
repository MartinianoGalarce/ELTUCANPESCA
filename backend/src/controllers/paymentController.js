// ─── Dependencias ──────────────────────────────────────────────────────────
const { Preference } = require('mercadopago');
const client = require('../config/mercadopago');
const Order = require('../models/Order');
const { sendOrderStatusEmail } = require('../utils/emails');

// ─── Crear preferencia de pago ─────────────────────────────────────────────
// POST /api/payments/create-preference/:orderId
const createPreference = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    if (order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    if (order.paymentMethod !== 'mercadopago') {
      return res.status(400).json({ error: 'Esta orden no es de Mercado Pago' });
    }

    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: order.items.map((item) => ({
          title: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          currency_id: 'ARS',
        })),
        payer: {
          name: order.user.name,
          email: order.user.email,
        },
        back_urls: {
          success: `${process.env.CLIENT_URL}/orden-confirmada/${order._id}`,
          failure: `${process.env.CLIENT_URL}/checkout`,
          pending: `${process.env.CLIENT_URL}/orden-confirmada/${order._id}`,
        },
        auto_return: 'approved',
        external_reference: order._id.toString(),
        notification_url: `${process.env.BACKEND_URL}/api/payments/webhook`,
      },
    });

    res.json({ preferenceId: result.id, initPoint: result.init_point });
  } catch (error) {
    console.error('Error MP:', error);
    res.status(500).json({ error: 'Error al crear preferencia', detail: error.message });
  }
};

// ─── Webhook de Mercado Pago ───────────────────────────────────────────────
// POST /api/payments/webhook
const handleWebhook = async (req, res) => {
  try {
    const { type, data } = req.body;

    if (type !== 'payment') {
      return res.sendStatus(200);
    }

    const { Payment } = require('mercadopago');
    const paymentClient = new Payment(client);
    const payment = await paymentClient.get({ id: data.id });

    if (payment.status !== 'approved') {
      return res.sendStatus(200);
    }

    const orderId = payment.external_reference;
    const order = await Order.findById(orderId).populate('user', 'name email');

    if (!order) {
      return res.sendStatus(200);
    }

    if (order.status === 'paid') {
      return res.sendStatus(200);
    }

    order.status = 'paid';
    order.paymentId = payment.id.toString();
    await order.save();

    try {
      await sendOrderStatusEmail(
        order.user.email,
        order.user.name,
        order._id.toString(),
        'paid'
      );
    } catch (emailErr) {
      console.error('Error enviando email:', emailErr.message);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Error en webhook:', error.message);
    res.sendStatus(500);
  }
};

module.exports = { createPreference, handleWebhook };