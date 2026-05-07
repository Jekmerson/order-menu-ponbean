const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { createOrder, getAllOrders, getOrderById, updateOrderStatus } = require('../controllers/orderController');

// Public (customer)
router.post('/', createOrder);
router.get('/:id', getOrderById);

// Protected (kasir/admin)
router.get('/', auth, getAllOrders);
router.patch('/:id/status', auth, updateOrderStatus);

module.exports = router;
