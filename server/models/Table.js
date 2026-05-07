const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Table = sequelize.define('Table', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nomor_meja: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  qr_code: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'tables',
});

module.exports = Table;
