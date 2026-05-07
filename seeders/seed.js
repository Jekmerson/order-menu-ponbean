const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { sequelize, User, Category, Menu, Table } = require('../models');

const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log('Koneksi database OK.');

    // Sync with force to reset tables
    await sequelize.sync({ force: true });
    console.log('Tabel berhasil dibuat ulang.');

    // Seed Users
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.bulkCreate([
      { nama: 'Admin Ponbean', username: 'admin', password: hashedPassword, role: 'admin' },
      { nama: 'Kasir 1', username: 'kasir1', password: await bcrypt.hash('kasir123', 10), role: 'kasir' },
    ]);
    console.log('Users seeded.');

    // Seed Categories
    const categories = await Category.bulkCreate([
      { nama: 'Coffee', icon: '☕' },
      { nama: 'Non-Coffee', icon: '🧋' },
      { nama: 'Makanan', icon: '🍽️' },
      { nama: 'Snack', icon: '🍿' },
    ]);
    console.log('Categories seeded.');

    // Seed Menus
    await Menu.bulkCreate([
      // Coffee
      { category_id: categories[0].id, nama: 'Espresso', deskripsi: 'Single shot espresso yang bold dan intense', harga: 18000, is_available: true },
      { category_id: categories[0].id, nama: 'Americano', deskripsi: 'Espresso dengan air panas, rasa clean dan smooth', harga: 22000, is_available: true },
      { category_id: categories[0].id, nama: 'Cappuccino', deskripsi: 'Espresso, steamed milk, dan foam yang creamy', harga: 28000, is_available: true },
      { category_id: categories[0].id, nama: 'Cafe Latte', deskripsi: 'Espresso dengan susu steamed yang lembut', harga: 28000, is_available: true },
      { category_id: categories[0].id, nama: 'Vanilla Latte', deskripsi: 'Cafe latte dengan sirup vanilla premium', harga: 32000, is_available: true },
      { category_id: categories[0].id, nama: 'Caramel Macchiato', deskripsi: 'Latte dengan drizzle karamel dan vanilla', harga: 35000, is_available: true },
      // Non-Coffee
      { category_id: categories[1].id, nama: 'Matcha Latte', deskripsi: 'Green tea matcha premium dengan susu', harga: 30000, is_available: true },
      { category_id: categories[1].id, nama: 'Coklat', deskripsi: 'Coklat premium dengan susu steamed', harga: 28000, is_available: true },
      { category_id: categories[1].id, nama: 'Thai Tea', deskripsi: 'Thai tea classic dengan susu creamer', harga: 25000, is_available: true },
      { category_id: categories[1].id, nama: 'Lemon Tea', deskripsi: 'Teh segar dengan perasan lemon asli', harga: 20000, is_available: true },
      // Makanan
      { category_id: categories[2].id, nama: 'Nasi Goreng Ponbean', deskripsi: 'Nasi goreng spesial dengan topping telur dan ayam', harga: 35000, is_available: true },
      { category_id: categories[2].id, nama: 'Mie Goreng', deskripsi: 'Mie goreng dengan sayuran dan telur', harga: 30000, is_available: true },
      { category_id: categories[2].id, nama: 'Sandwich Club', deskripsi: 'Roti panggang dengan ayam, telur, dan sayuran', harga: 32000, is_available: true },
      { category_id: categories[2].id, nama: 'Chicken Wings', deskripsi: '6 pcs sayap ayam goreng crispy dengan saus', harga: 38000, is_available: true },
      // Snack
      { category_id: categories[3].id, nama: 'French Fries', deskripsi: 'Kentang goreng crispy dengan saus sambal mayo', harga: 22000, is_available: true },
      { category_id: categories[3].id, nama: 'Roti Bakar', deskripsi: 'Roti bakar dengan selai coklat dan keju', harga: 20000, is_available: true },
      { category_id: categories[3].id, nama: 'Pisang Goreng', deskripsi: 'Pisang goreng crispy dengan topping keju dan coklat', harga: 18000, is_available: true },
    ]);
    console.log('Menus seeded.');

    // Seed Tables (10 meja) + Generate QR Codes
    const QRCode = require('qrcode');
    const path = require('path');
    const fs = require('fs');
    const qrDir = path.join(__dirname, '..', 'uploads', 'qrcodes');
    if (!fs.existsSync(qrDir)) fs.mkdirSync(qrDir, { recursive: true });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    for (let i = 1; i <= 10; i++) {
      const table = await Table.create({ nomor_meja: i, is_active: true });

      // Generate QR Code
      const menuUrl = `${clientUrl}/menu/${table.id}`;
      const qrFilename = `qr-meja-${i}.png`;
      await QRCode.toFile(path.join(qrDir, qrFilename), menuUrl, {
        width: 600, margin: 2, errorCorrectionLevel: 'H',
        color: { dark: '#1E293B', light: '#FFFFFF' },
      });
      table.qr_code = `qrcodes/${qrFilename}`;
      await table.save();
    }
    console.log('Tables seeded (10 meja) + QR Codes generated.');

    console.log('\n=== Seeding selesai! ===');
    console.log('Login Admin: admin / admin123');
    console.log('Login Kasir: kasir1 / kasir123');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seed();
