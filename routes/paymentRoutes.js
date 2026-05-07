const express = require('express');
const router = express.Router();
const { createPayment, handleNotification, checkPaymentStatus } = require('../controllers/paymentController');

// Create payment (from customer)
router.post('/create', createPayment);

// Midtrans notification webhook (POST from Midtrans servers)
router.post('/notification', handleNotification);

// Check status
router.get('/status/:orderId', checkPaymentStatus);

module.exports = router;
