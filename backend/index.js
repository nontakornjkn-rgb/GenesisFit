// backend/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// JSON parser for normal routes
app.use(cors());
app.use(express.json());

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Initialize Firebase (side-effect initialize)
const admin = require('./firebase');

// Routes
app.get('/', (req, res) => res.send('GenesisFit backend OK'));

// Example: create checkout session (adjust to your needs)
app.post('/create-checkout-session', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: process.env.SUCCESS_URL || 'https://example.com/success',
      cancel_url: process.env.CANCEL_URL || 'https://example.com/cancel',
    });
    res.json({ id: session.id });
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

// Webhook (mounted at /webhook) — uses raw body parsing inside webhook module
app.use('/webhook', require('./webhook'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`GenesisFit backend listening on port ${PORT}`);
});
