const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Menu = sequelize.define('Menu', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'categories',
      key: 'id',
    },
  },
  nama: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  deskripsi: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  harga: {
    type: DataTypes.DECIMAL(10, 0),
    allowNull: false,
  },
  gambar: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  is_available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'menus',
});

module.exports = Menu;
