const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nama: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  icon: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: '🍽️',
  },
}, {
  tableName: 'categories',
});

module.exports = Category;
