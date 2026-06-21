const { Sequelize } = require('sequelize');
require('dotenv').config();

// Options shared between both connection methods
const commonOptions = {
  dialect: 'mysql',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: true,
  },
};

// Railway provides MYSQL_URL as a single connection string
// Support both MYSQL_URL and DATABASE_URL, fallback to individual vars for local dev
const connectionUrl = process.env.MYSQL_URL || process.env.DATABASE_URL;

const sequelize = connectionUrl
  ? new Sequelize(connectionUrl, commonOptions)
  : new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASS,
      {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        ...commonOptions,
      }
    );

module.exports = sequelize;
