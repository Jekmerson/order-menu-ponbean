const { Order, OrderItem, Menu, Table } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

const getReport = async (req, res) => {
  try {
    const { start_date, end_date, period } = req.query;
    const where = { status: { [Op.in]: ['paid', 'processing', 'completed'] } };

    if (start_date && end_date) {
      where.created_at = {
        [Op.between]: [new Date(start_date + ' 00:00:00'), new Date(end_date + ' 23:59:59')],
      };
    }

    const orders = await Order.findAll({
      where,
      include: [
        { model: Table, as: 'table' },
        { model: OrderItem, as: 'items', include: [{ model: Menu, as: 'menu', attributes: ['id', 'nama'] }] },
      ],
      order: [['created_at', 'DESC']],
    });

    const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Best selling items
    const itemMap = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const name = item.menu ? item.menu.nama : 'Unknown';
        if (!itemMap[name]) itemMap[name] = { nama: name, qty: 0, revenue: 0 };
        itemMap[name].qty += item.quantity;
        itemMap[name].revenue += parseFloat(item.subtotal);
      });
    });
    const bestSellers = Object.values(itemMap).sort((a, b) => b.qty - a.qty).slice(0, 10);

    res.json({ totalRevenue, totalOrders, avgOrderValue, bestSellers, orders });
  } catch (error) {
    console.error('Report error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

module.exports = { getReport };
