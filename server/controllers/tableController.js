const { Table } = require('../models');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

const QR_DIR = path.join(__dirname, '..', 'uploads', 'qrcodes');

// Ensure QR directory exists
const ensureQRDir = () => {
  if (!fs.existsSync(QR_DIR)) fs.mkdirSync(QR_DIR, { recursive: true });
};

// Generate a QR code file for a single table
const generateQRForTable = async (table) => {
  ensureQRDir();
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const menuUrl = `${clientUrl}/menu/${table.id}`;
  const qrFilename = `qr-meja-${table.nomor_meja}.png`;
  const qrPath = path.join(QR_DIR, qrFilename);

  await QRCode.toFile(qrPath, menuUrl, {
    width: 600,
    margin: 2,
    errorCorrectionLevel: 'H',
    color: { dark: '#1E293B', light: '#FFFFFF' },
  });

  table.qr_code = `qrcodes/${qrFilename}`;
  await table.save();
  return { qrFilename, menuUrl };
};

// Get all tables
const getAllTables = async (req, res) => {
  try {
    const tables = await Table.findAll({ order: [['nomor_meja', 'ASC']] });
    res.json(tables);
  } catch (error) {
    console.error('Get tables error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// Create table & auto-generate QR Code
const createTable = async (req, res) => {
  try {
    const { nomor_meja } = req.body;
    if (!nomor_meja) return res.status(400).json({ message: 'Nomor meja harus diisi.' });

    const existing = await Table.findOne({ where: { nomor_meja } });
    if (existing) return res.status(400).json({ message: 'Nomor meja sudah ada.' });

    const table = await Table.create({ nomor_meja });
    const { menuUrl } = await generateQRForTable(table);

    res.status(201).json({ message: 'Meja berhasil ditambahkan', table, menu_url: menuUrl });
  } catch (error) {
    console.error('Create table error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// Delete table & its QR code file
const deleteTable = async (req, res) => {
  try {
    const table = await Table.findByPk(req.params.id);
    if (!table) return res.status(404).json({ message: 'Meja tidak ditemukan.' });

    if (table.qr_code) {
      const qrPath = path.join(__dirname, '..', 'uploads', table.qr_code);
      if (fs.existsSync(qrPath)) fs.unlinkSync(qrPath);
    }

    await table.destroy();
    res.json({ message: 'Meja berhasil dihapus.' });
  } catch (error) {
    console.error('Delete table error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// Toggle table active status
const toggleTableStatus = async (req, res) => {
  try {
    const table = await Table.findByPk(req.params.id);
    if (!table) return res.status(404).json({ message: 'Meja tidak ditemukan.' });

    table.is_active = !table.is_active;
    await table.save();
    res.json({ message: `Meja ${table.is_active ? 'diaktifkan' : 'dinonaktifkan'}`, table });
  } catch (error) {
    console.error('Toggle table error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// Regenerate QR code for a single table
const regenerateQR = async (req, res) => {
  try {
    const table = await Table.findByPk(req.params.id);
    if (!table) return res.status(404).json({ message: 'Meja tidak ditemukan.' });

    // Delete old QR if exists
    if (table.qr_code) {
      const oldPath = path.join(__dirname, '..', 'uploads', table.qr_code);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const { menuUrl } = await generateQRForTable(table);
    res.json({ message: 'QR Code berhasil di-generate ulang.', table, menu_url: menuUrl });
  } catch (error) {
    console.error('Regenerate QR error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// Regenerate QR codes for ALL tables
const regenerateAllQR = async (req, res) => {
  try {
    const tables = await Table.findAll({ order: [['nomor_meja', 'ASC']] });

    for (const table of tables) {
      if (table.qr_code) {
        const oldPath = path.join(__dirname, '..', 'uploads', table.qr_code);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      await generateQRForTable(table);
    }

    res.json({ message: `QR Code berhasil di-generate untuk ${tables.length} meja.`, count: tables.length });
  } catch (error) {
    console.error('Regenerate all QR error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// Get QR code as base64 data URL (for frontend rendering without file dependency)
const getQRDataUrl = async (req, res) => {
  try {
    const table = await Table.findByPk(req.params.id);
    if (!table) return res.status(404).json({ message: 'Meja tidak ditemukan.' });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const menuUrl = `${clientUrl}/menu/${table.id}`;

    const dataUrl = await QRCode.toDataURL(menuUrl, {
      width: 600,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: { dark: '#1E293B', light: '#FFFFFF' },
    });

    res.json({
      table_id: table.id,
      nomor_meja: table.nomor_meja,
      menu_url: menuUrl,
      qr_data_url: dataUrl,
    });
  } catch (error) {
    console.error('Get QR data URL error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// Get printable card HTML for a table's QR code
const getQRPrintCard = async (req, res) => {
  try {
    const { id } = req.params;

    // If id === 'all', generate for all tables
    let tables;
    if (id === 'all') {
      tables = await Table.findAll({ where: { is_active: true }, order: [['nomor_meja', 'ASC']] });
    } else {
      const table = await Table.findByPk(id);
      if (!table) return res.status(404).json({ message: 'Meja tidak ditemukan.' });
      tables = [table];
    }

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const cards = [];

    for (const table of tables) {
      const menuUrl = `${clientUrl}/menu/${table.id}`;
      const dataUrl = await QRCode.toDataURL(menuUrl, {
        width: 400,
        margin: 2,
        errorCorrectionLevel: 'H',
        color: { dark: '#1E293B', light: '#FFFFFF' },
      });

      cards.push({
        id: table.id,
        nomor_meja: table.nomor_meja,
        menu_url: menuUrl,
        qr_data_url: dataUrl,
      });
    }

    res.json(cards);
  } catch (error) {
    console.error('Get QR print card error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

module.exports = {
  getAllTables,
  createTable,
  deleteTable,
  toggleTableStatus,
  regenerateQR,
  regenerateAllQR,
  getQRDataUrl,
  getQRPrintCard,
};
