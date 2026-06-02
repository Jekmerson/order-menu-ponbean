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
      { nama: 'Milk-Based', icon: '🥛' },
      { nama: 'Tea & Soda', icon: '🧋' },
      { nama: 'Food & Snack', icon: '🍽️' },
    ]);
    console.log('Categories seeded.');

    // Seed Menus - Pon Bean Coffee Shop
    await Menu.bulkCreate([
      // ===== COFFEE =====
      { category_id: categories[0].id, nama: 'Espresso Arabica Gayo', deskripsi: 'Espresso premium dari biji kopi Arabica Gayo pilihan', harga: 19000, is_available: true },
      { category_id: categories[0].id, nama: 'Single Arabica Gayo', deskripsi: 'Single origin Arabica Gayo dengan karakter rasa unik', harga: 12000, is_available: true },
      { category_id: categories[0].id, nama: 'Coffee Latte', deskripsi: 'Espresso dengan steamed milk yang lembut dan creamy', harga: 15000, is_available: true },
      { category_id: categories[0].id, nama: 'Cappuccino', deskripsi: 'Espresso, steamed milk, dan foam yang creamy sempurna', harga: 15000, is_available: true },
      { category_id: categories[0].id, nama: 'Americano', deskripsi: 'Espresso dengan air panas, rasa bersih dan ringan', harga: 12000, is_available: true },
      { category_id: categories[0].id, nama: 'Lychee Americano', deskripsi: 'Americano segar dengan sentuhan sirup lychee', harga: 18000, is_available: true },
      { category_id: categories[0].id, nama: 'Aren Latte', deskripsi: 'Coffee latte manis alami dengan gula aren asli', harga: 15000, is_available: true },
      { category_id: categories[0].id, nama: 'Salted Aren Latte', deskripsi: 'Aren latte dengan sentuhan garam Himalaya yang unik', harga: 15000, is_available: true },
      { category_id: categories[0].id, nama: 'Creamy Aren Latte', deskripsi: 'Aren latte ekstra creamy dengan topping foam susu', harga: 29000, is_available: true },
      { category_id: categories[0].id, nama: 'Pandan Latte', deskripsi: 'Coffee latte harum dengan sirup pandan alami', harga: 16000, is_available: true },
      { category_id: categories[0].id, nama: 'Vanilla Latte', deskripsi: 'Coffee latte dengan sirup vanilla premium', harga: 16000, is_available: true },
      { category_id: categories[0].id, nama: 'Caramel Latte', deskripsi: 'Coffee latte manis dengan drizzle karamel', harga: 16000, is_available: true },
      { category_id: categories[0].id, nama: 'Salted Caramel Latte', deskripsi: 'Caramel latte dengan sentuhan garam untuk keseimbangan rasa', harga: 16000, is_available: true },
      { category_id: categories[0].id, nama: 'Hazelnut Latte', deskripsi: 'Coffee latte dengan sirup hazelnut yang kaya rasa', harga: 18000, is_available: true },
      { category_id: categories[0].id, nama: 'Butterscotch Latte', deskripsi: 'Coffee latte dengan sirup butterscotch yang karamel', harga: 18000, is_available: true },
      { category_id: categories[0].id, nama: 'Mocha Latte', deskripsi: 'Coffee latte dengan coklat premium yang kaya', harga: 22000, is_available: true },
      { category_id: categories[0].id, nama: 'Lemon Coffee', deskripsi: 'Americano segar dengan perasan lemon asli', harga: 22000, is_available: true },

      // ===== MILK-BASED =====
      { category_id: categories[1].id, nama: 'Matcha Latte', deskripsi: 'Matcha premium Jepang dengan steamed milk yang creamy', harga: 20000, is_available: true },
      { category_id: categories[1].id, nama: 'Choco Latte', deskripsi: 'Coklat premium dengan steamed milk yang lezat', harga: 18000, is_available: true },
      { category_id: categories[1].id, nama: 'Salted Choco Latte', deskripsi: 'Choco latte dengan sentuhan garam yang menyeimbangkan rasa', harga: 18000, is_available: true },
      { category_id: categories[1].id, nama: 'Red Velvet Latte', deskripsi: 'Minuman milk-based dengan rasa red velvet yang kaya', harga: 15000, is_available: true },
      { category_id: categories[1].id, nama: 'Brown Sugar Fresh Milk', deskripsi: 'Fresh milk premium dengan gula aren brown sugar', harga: 15000, is_available: true },
      { category_id: categories[1].id, nama: 'Salted Brown Sugar', deskripsi: 'Brown sugar fresh milk dengan sentuhan garam', harga: 15000, is_available: true },
      { category_id: categories[1].id, nama: 'Fresh Milk', deskripsi: 'Susu segar murni pilihan terbaik', harga: 15000, is_available: true },
      { category_id: categories[1].id, nama: 'Salted Creamy Brown', deskripsi: 'Brown sugar milk ekstra creamy dengan garam Himalaya', harga: 16000, is_available: true },
      { category_id: categories[1].id, nama: 'Sugar Fresh Milk', deskripsi: 'Fresh milk manis dengan gula pilihan', harga: 16000, is_available: true },
      { category_id: categories[1].id, nama: 'Salted Caramel Milk', deskripsi: 'Fresh milk dengan sirup karamel dan sentuhan garam', harga: 18000, is_available: true },
      { category_id: categories[1].id, nama: 'Lychee Yakult Milk', deskripsi: 'Perpaduan lychee, yakult, dan fresh milk yang menyegarkan', harga: 18000, is_available: true },
      { category_id: categories[1].id, nama: 'Strawberry Milk Bomb', deskripsi: 'Fresh milk dengan ledakan rasa strawberry yang intens', harga: 18000, is_available: true },
      { category_id: categories[1].id, nama: 'Strawberry Lychee Milk', deskripsi: 'Perpaduan strawberry dan lychee dalam fresh milk', harga: 20000, is_available: true },
      { category_id: categories[1].id, nama: 'Strawberry Choco Milk', deskripsi: 'Kombinasi strawberry dan coklat dalam fresh milk', harga: 20000, is_available: true },
      { category_id: categories[1].id, nama: 'Strawberry Matcha Milk', deskripsi: 'Perpaduan unik strawberry dan matcha dalam fresh milk', harga: 22000, is_available: true },
      { category_id: categories[1].id, nama: 'Strawberry Yakult Milk', deskripsi: 'Strawberry milk segar dengan tambahan yakult', harga: 22000, is_available: true },
      { category_id: categories[1].id, nama: 'Strawberry Yogurt Milk', deskripsi: 'Fresh milk dengan strawberry dan yogurt yang creamy', harga: 22000, is_available: true },
      { category_id: categories[1].id, nama: 'Orange Yakult Milk', deskripsi: 'Fresh milk dengan orange dan yakult yang menyegarkan', harga: 20000, is_available: true },
      { category_id: categories[1].id, nama: 'Orange Yogurt Milk', deskripsi: 'Fresh milk dengan orange dan yogurt yang lezat', harga: 20000, is_available: true },

      // ===== TEA & SODA =====
      { category_id: categories[2].id, nama: 'Mineral Water', deskripsi: 'Air mineral segar', harga: 5000, is_available: true },
      { category_id: categories[2].id, nama: 'Plain Tea', deskripsi: 'Teh tawar panas atau dingin', harga: 10000, is_available: true },
      { category_id: categories[2].id, nama: 'Sweet Tea', deskripsi: 'Teh manis klasik yang menyegarkan', harga: 12000, is_available: true },
      { category_id: categories[2].id, nama: 'Ocha Tea', deskripsi: 'Teh ocha Jepang dengan aroma khas yang harum', harga: 12000, is_available: true },
      { category_id: categories[2].id, nama: 'Lychee Tea', deskripsi: 'Teh segar dengan rasa lychee yang manis', harga: 15000, is_available: true },
      { category_id: categories[2].id, nama: 'Lemon Tea', deskripsi: 'Teh segar dengan perasan lemon asli', harga: 15000, is_available: true },
      { category_id: categories[2].id, nama: 'Apple Tea', deskripsi: 'Teh dengan rasa apel yang segar dan manis', harga: 15000, is_available: true },
      { category_id: categories[2].id, nama: 'Iced Orange', deskripsi: 'Jus jeruk segar dingin yang menyegarkan', harga: 12000, is_available: true },
      { category_id: categories[2].id, nama: 'Orange Sunset', deskripsi: 'Minuman jeruk cantik dengan gradasi warna sunset', harga: 16000, is_available: true },
      { category_id: categories[2].id, nama: 'Orange Sunset Soda', deskripsi: 'Orange sunset bersoda yang menyegarkan', harga: 20000, is_available: true },
      { category_id: categories[2].id, nama: 'Strawberry Lychee Soda', deskripsi: 'Soda segar dengan perpaduan strawberry dan lychee', harga: 20000, is_available: true },
      { category_id: categories[2].id, nama: 'Strawberry Yakult Soda', deskripsi: 'Soda menyegarkan dengan strawberry dan yakult', harga: 22000, is_available: true },

      // ===== FOOD & SNACK =====
      { category_id: categories[3].id, nama: 'Indomie Goreng Telur Biasa', deskripsi: 'Indomie goreng dengan telur ceplok spesial Pon Bean', harga: 15000, is_available: true },
      { category_id: categories[3].id, nama: 'Indomie Tumis Aceh Telur', deskripsi: 'Indomie tumis bumbu Aceh dengan telur ceplok', harga: 20000, is_available: true },
      { category_id: categories[3].id, nama: 'Indomie Tumis Aceh Ayam', deskripsi: 'Indomie tumis bumbu Aceh dengan potongan ayam suwir', harga: 22000, is_available: true },
      { category_id: categories[3].id, nama: 'Indomie Tumis Aceh Daging', deskripsi: 'Indomie tumis bumbu Aceh dengan potongan daging sapi', harga: 25000, is_available: true },
      { category_id: categories[3].id, nama: 'Indomie Tumis Aceh Udang', deskripsi: 'Indomie tumis bumbu Aceh dengan udang segar pilihan', harga: 25000, is_available: true },
      { category_id: categories[3].id, nama: 'Nasi Goreng Sunti Aceh', deskripsi: 'Nasi goreng khas Aceh dengan bumbu sunti yang otentik', harga: 25000, is_available: true },
      { category_id: categories[3].id, nama: 'Roti Canal Gula/Susu', deskripsi: 'Roti canal khas Aceh disajikan dengan gula atau susu', harga: 12000, is_available: true },
      { category_id: categories[3].id, nama: 'French Fries', deskripsi: 'Kentang goreng crispy dengan saus sambal mayo', harga: 15000, is_available: true },
      { category_id: categories[3].id, nama: 'Mix Platter', deskripsi: 'Kombinasi berbagai pilihan snack dalam satu sajian', harga: 25000, is_available: true },
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
