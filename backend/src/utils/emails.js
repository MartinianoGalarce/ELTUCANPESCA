// ─── Dependencias ──────────────────────────────────────────────────────────
const nodemailer = require('nodemailer');

// ─── Transporter de Gmail ──────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

const FROM = `"El Tucán Pesca" <${process.env.GMAIL_USER}>`;

// ─── Email de verificación de cuenta ──────────────────────────────────────
const sendVerificationEmail = async (to, name, token) => {
  const url = `${process.env.CLIENT_URL}/verificar-email?token=${token}`;
  await transporter.sendMail({
    from: FROM,
    to,
    subject: 'Verificá tu cuenta — El Tucán Pesca',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #2D6A2D;">¡Bienvenido, ${name}!</h2>
        <p>Gracias por registrarte en El Tucán Pesca. Para activar tu cuenta hacé click en el botón:</p>
        <a href="${url}" style="display:inline-block;background:#2D6A2D;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0;">
          Verificar mi cuenta
        </a>
        <p style="color:#666;font-size:12px;">Este link expira en 24 horas. Si no creaste una cuenta ignorá este mensaje.</p>
      </div>
    `,
  });
};

// ─── Email de cambio de estado de pedido ──────────────────────────────────
const STATUS_MESSAGES = {
  paid:       { subject: 'Pago confirmado ✅', msg: 'Tu pago fue confirmado. Estamos preparando tu pedido.' },
  preparing:  { subject: 'Preparando tu pedido 📦', msg: 'Tu pedido está siendo preparado.' },
  shipped:    { subject: 'Tu pedido fue enviado 🚚', msg: 'Tu pedido está en camino.' },
  delivered:  { subject: 'Pedido entregado ✅', msg: '¡Tu pedido fue entregado! Esperamos que lo disfrutes.' },
  cancelled:  { subject: 'Pedido cancelado', msg: 'Tu pedido fue cancelado. Si tenés dudas contactanos por Instagram.' },
};

const sendOrderStatusEmail = async (to, name, orderId, status) => {
  const info = STATUS_MESSAGES[status];
  if (!info) return;

  await transporter.sendMail({
    from: FROM,
    to,
    subject: `${info.subject} — Pedido #${orderId.slice(-8).toUpperCase()}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #2D6A2D;">Hola, ${name}!</h2>
        <p>${info.msg}</p>
        <p style="color:#666;">Número de pedido: <strong>#${orderId.slice(-8).toUpperCase()}</strong></p>
        <a href="${process.env.CLIENT_URL}/mis-pedidos" style="display:inline-block;background:#2D6A2D;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0;">
          Ver mis pedidos
        </a>
        <p style="color:#666;font-size:12px;">El Tucán Pesca — Tapalque, Buenos Aires</p>
      </div>
    `,
  });
};

// ─── Email de recuperación de contraseña ──────────────────────────────────
const sendPasswordResetEmail = async (to, name, token) => {
  const url = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: FROM,
    to,
    subject: 'Recuperar contraseña — El Tucán Pesca',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #2D6A2D;">Recuperar contraseña</h2>
        <p>Hola ${name}, recibimos una solicitud para resetear tu contraseña.</p>
        <a href="${url}" style="display:inline-block;background:#2D6A2D;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0;">
          Resetear contraseña
        </a>
        <p style="color:#666;font-size:12px;">Este link expira en 1 hora. Si no solicitaste esto ignorá este mensaje.</p>
      </div>
    `,
  });
};

module.exports = { sendVerificationEmail, sendOrderStatusEmail, sendPasswordResetEmail };