const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('../services/db');

/**
 * Webhook do Stripe para processar pagamentos e liberar acesso
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Lógica de negócio baseada no evento
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      
      // 1. Vincular Customer ID ao Usuário
      const userId = session.client_reference_id;
      const customerId = session.customer;

      await db.query('UPDATE users SET stripe_customer_id = $1 WHERE id = $2', [customerId, userId]);

      // 2. Criar Assinatura no Banco
      // Definindo validade de 30 dias
      await db.query(`
        INSERT INTO subscriptions (user_id, plan_type, status, end_date) 
        VALUES ($1, $2, $3, NOW() + INTERVAL '30 days')`, 
        [userId, 'premium', 'active']);

      console.log(`[PAYMENT] Plano liberado para o usuário ${userId}`);
      break;

    case 'invoice.payment_failed':
      // Bloquear acesso do usuário
      const failedInvoice = event.data.object;
      await db.query(`
        UPDATE subscriptions SET status = 'past_due' 
        WHERE user_id = (SELECT id FROM users WHERE stripe_customer_id = $1)`, 
        [failedInvoice.customer]);
      break;
  }

  res.json({ received: true });
});

module.exports = router;
