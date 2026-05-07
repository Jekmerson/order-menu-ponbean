const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  order_number: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true,
  },
  table_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'tables',
      key: 'id',
    },
  },
  customer_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM(
      'pending_payment',
      'paid',
      'processing',
      'completed',
      'cancelled'
    ),
    defaultValue: 'pending_payment',
  },
  payment_method: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  payment_id: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  total_amount: {
    type: DataTypes.DECIMAL(12, 0),
    allowNull: false,
    defaultValue: 0,
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'orders',
});

module.exports = Order;
