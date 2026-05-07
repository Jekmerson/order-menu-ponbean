// Script untuk membuat database jika belum ada
const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const createDatabase = async () => {
  let connection;
  try {
    // Coba koneksi tanpa database name dulu
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
    });

    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    console.log(`Database "${process.env.DB_NAME}" berhasil dibuat / sudah ada.`);
  } catch (error) {
    console.error('Error membuat database:', error.message);
    console.log('\n=== SOLUSI ===');
    console.log('1. Pastikan Laragon sudah running (MySQL aktif)');
    console.log('2. Jika MySQL butuh password, ubah DB_PASS di file .env');
    console.log('3. Atau buat database manual di phpMyAdmin: http://localhost/phpmyadmin');
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
};

module.exports = createDatabase;

// Jika dijalankan langsung
if (require.main === module) {
  createDatabase().then(() => process.exit(0));
}
