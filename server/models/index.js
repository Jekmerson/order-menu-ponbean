const sequelize = require('../config/db');
const User = require('./User');
const Category = require('./Category');
const Menu = require('./Menu');
const Table = require('./Table');
const Order = require('./Order');
const OrderItem = require('./OrderItem');

// ===== Associations =====

// Category <-> Menu
Category.hasMany(Menu, { foreignKey: 'category_id', as: 'menus' });
Menu.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// Table <-> Order
Table.hasMany(Order, { foreignKey: 'table_id', as: 'orders' });
Order.belongsTo(Table, { foreignKey: 'table_id', as: 'table' });

// Order <-> OrderItem
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// Menu <-> OrderItem
Menu.hasMany(OrderItem, { foreignKey: 'menu_id', as: 'order_items' });
OrderItem.belongsTo(Menu, { foreignKey: 'menu_id', as: 'menu' });

module.exports = {
  sequelize,
  User,
  Category,
  Menu,
  Table,
  Order,
  OrderItem,
};
