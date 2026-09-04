const nodemailer = require('nodemailer');

function createTransporter() {
  const required = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD', 'MAIL_FROM'];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) throw new Error(`Missing email configuration: ${missing.join(', ')}`);
  return nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT), secure: process.env.SMTP_SECURE === 'true', auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } });
}

async function sendPasswordResetEmail({ email, name, resetUrl }) {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: email,
    subject: 'Reset your HealthConnect Nigeria password',
    text: `Hello ${name},\n\nUse this link to reset your HealthConnect Nigeria password. It expires in 15 minutes and can only be used once:\n\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`,
    html: `<p>Hello ${escapeHtml(name)},</p><p>Use the secure link below to reset your HealthConnect Nigeria password. It expires in <strong>15 minutes</strong> and can only be used once.</p><p><a href="${escapeHtml(resetUrl)}">Reset my password</a></p><p>If you did not request this, you can ignore this email.</p>`
  });
}

function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character])); }

module.exports = { sendPasswordResetEmail };
