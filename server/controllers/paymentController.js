const { snap, coreApi } = require('../config/midtrans');
const { Order, OrderItem, Menu, Table, Category } = require('../models');

// Create Midtrans payment (Snap Token)
const createPayment = async (req, res) => {
  try {
    const { order_id } = req.body;

    const order = await Order.findByPk(order_id, {
      include: [
        { model: Table, as: 'table' },
        { model: OrderItem, as: 'items', include: [{ model: Menu, as: 'menu' }] },
      ],
    });

    if (!order) {
      return res.status(404).json({ message: 'Pesanan tidak ditemukan.' });
    }

    if (order.status !== 'pending_payment') {
      return res.status(400).json({ message: 'Pesanan sudah dibayar atau dibatalkan.' });
    }

    // Build Midtrans transaction parameters
    const parameter = {
      transaction_details: {
        order_id: order.order_number + '-' + Date.now(), // Unique per attempt
        gross_amount: parseInt(order.total_amount),
      },
      item_details: order.items.map(item => ({
        id: `MENU-${item.menu_id}`,
        price: parseInt(item.price),
        quantity: item.quantity,
        name: item.menu ? item.menu.nama.substring(0, 50) : 'Menu Item',
      })),
      customer_details: {
        first_name: order.customer_name || `Meja ${order.table?.nomor_meja}`,
      },
      callbacks: {
        finish: `${process.env.CLIENT_URL || 'http://localhost:5173'}/order/${order.order_number}`,
      },
    };

    const transaction = await snap.createTransaction(parameter);

    // Save payment_id (snap token) to order
    order.payment_id = transaction.token;
    order.payment_method = 'midtrans';
    await order.save();

    res.json({
      snap_token: transaction.token,
      redirect_url: transaction.redirect_url,
      order_number: order.order_number,
    });
  } catch (error) {
    console.error('Midtrans create payment error:', error);
    res.status(500).json({
      message: 'Gagal membuat pembayaran.',
      detail: error.message,
    });
  }
};

// Handle Midtrans notification webhook
const handleNotification = async (req, res) => {
  try {
    const notification = req.body;

    const statusResponse = await coreApi.transaction.notification(notification);
    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    // Extract original order_number (remove the timestamp suffix)
    const orderNumber = orderId.replace(/-\d+$/, '');

    const order = await Order.findOne({
      where: { order_number: orderNumber },
      include: [
        { model: Table, as: 'table' },
        { model: OrderItem, as: 'items', include: [{ model: Menu, as: 'menu' }] },
      ],
    });

    if (!order) {
      console.log(`Order ${orderNumber} not found for notification`);
      return res.status(200).json({ message: 'OK' });
    }

    let newStatus = order.status;

    if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
      if (fraudStatus === 'accept' || !fraudStatus) {
        newStatus = 'paid';
      }
    } else if (transactionStatus === 'deny' || transactionStatus === 'cancel' || transactionStatus === 'expire') {
      newStatus = 'cancelled';
    } else if (transactionStatus === 'pending') {
      newStatus = 'pending_payment';
    }

    if (order.status !== newStatus) {
      order.status = newStatus;
      order.payment_method = statusResponse.payment_type || 'midtrans';
      await order.save();

      // Reload with associations
      const updatedOrder = await Order.findByPk(order.id, {
        include: [
          { model: Table, as: 'table' },
          { model: OrderItem, as: 'items', include: [{ model: Menu, as: 'menu' }] },
        ],
      });

      // Emit socket event
      const io = req.app.get('io');
      if (io) {
        io.emit('order_updated', updatedOrder);
      }
    }

    res.status(200).json({ message: 'OK' });
  } catch (error) {
    console.error('Midtrans notification error:', error);
    res.status(500).json({ message: 'Error processing notification.' });
  }
};

// Check payment status
const checkPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({
      where: { order_number: orderId },
    });

    if (!order) {
      return res.status(404).json({ message: 'Pesanan tidak ditemukan.' });
    }

    res.json({
      order_number: order.order_number,
      status: order.status,
      payment_method: order.payment_method,
      total_amount: order.total_amount,
    });
  } catch (error) {
    console.error('Check payment status error:', error);
    res.status(500).json({ message: 'Gagal mengecek status pembayaran.' });
  }
};

module.exports = { createPayment, handleNotification, checkPaymentStatus };
