const { Order, OrderItem, Menu, Table, Category } = require('../models');
const { Op } = require('sequelize');

// Generate order number: ORD-YYYYMMDD-XXX
const generateOrderNumber = async () => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `ORD-${dateStr}-`;

  const lastOrder = await Order.findOne({
    where: { order_number: { [Op.like]: `${prefix}%` } },
    order: [['order_number', 'DESC']],
  });

  let nextNum = 1;
  if (lastOrder) {
    const lastNum = parseInt(lastOrder.order_number.split('-').pop());
    nextNum = lastNum + 1;
  }

  return `${prefix}${String(nextNum).padStart(3, '0')}`;
};

// Create order (customer - public)
const createOrder = async (req, res) => {
  try {
    const { table_id, customer_name, items, note } = req.body;

    if (!table_id || !items || items.length === 0) {
      return res.status(400).json({ message: 'Meja dan item pesanan harus diisi.' });
    }

    // Verify table exists
    const table = await Table.findByPk(table_id);
    if (!table || !table.is_active) {
      return res.status(400).json({ message: 'Meja tidak valid atau tidak aktif.' });
    }

    // Calculate total and validate items
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const menu = await Menu.findByPk(item.menu_id);
      if (!menu) {
        return res.status(400).json({ message: `Menu dengan ID ${item.menu_id} tidak ditemukan.` });
      }
      if (!menu.is_available) {
        return res.status(400).json({ message: `Menu "${menu.nama}" sedang tidak tersedia.` });
      }

      const subtotal = menu.harga * item.quantity;
      totalAmount += subtotal;

      orderItems.push({
        menu_id: item.menu_id,
        quantity: item.quantity,
        price: menu.harga,
        subtotal,
        note: item.note || null,
      });
    }

    const orderNumber = await generateOrderNumber();

    const order = await Order.create({
      order_number: orderNumber,
      table_id,
      customer_name: customer_name || null,
      total_amount: totalAmount,
      note: note || null,
      status: 'pending_payment',
    });

    // Create order items
    for (const item of orderItems) {
      await OrderItem.create({ ...item, order_id: order.id });
    }

    // Fetch complete order with relations
    const completeOrder = await Order.findByPk(order.id, {
      include: [
        { model: Table, as: 'table' },
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Menu, as: 'menu', include: [{ model: Category, as: 'category' }] }],
        },
      ],
    });

    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('new_order', completeOrder);
    }

    res.status(201).json({
      message: 'Pesanan berhasil dibuat',
      order: completeOrder,
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// Get all orders (kasir/admin)
const getAllOrders = async (req, res) => {
  try {
    const where = {};
    if (req.query.status) {
      where.status = req.query.status;
    }
    if (req.query.date) {
      const startDate = new Date(req.query.date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(req.query.date);
      endDate.setHours(23, 59, 59, 999);
      where.created_at = { [Op.between]: [startDate, endDate] };
    }

    const orders = await Order.findAll({
      where,
      include: [
        { model: Table, as: 'table' },
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Menu, as: 'menu', attributes: ['id', 'nama', 'gambar'] }],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// Get order by ID or order_number (public - for customer tracking)
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const where = isNaN(id) ? { order_number: id } : { id };

    const order = await Order.findOne({
      where,
      include: [
        { model: Table, as: 'table' },
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Menu, as: 'menu', include: [{ model: Category, as: 'category' }] }],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ message: 'Pesanan tidak ditemukan.' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// Update order status (kasir)
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending_payment', 'paid', 'processing', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Status tidak valid.' });
    }

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ message: 'Pesanan tidak ditemukan.' });
    }

    order.status = status;
    await order.save();

    const updatedOrder = await Order.findByPk(id, {
      include: [
        { model: Table, as: 'table' },
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Menu, as: 'menu' }],
        },
      ],
    });

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.emit('order_updated', updatedOrder);
    }

    res.json({ message: 'Status pesanan berhasil diperbarui', order: updatedOrder });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
};
