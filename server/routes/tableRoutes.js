const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');
const {
  getAllTables,
  createTable,
  deleteTable,
  toggleTableStatus,
  regenerateQR,
  regenerateAllQR,
  getQRDataUrl,
  getQRPrintCard,
} = require('../controllers/tableController');

// Public
router.get('/', getAllTables);

// Admin only
router.post('/', auth, adminOnly, createTable);
router.delete('/:id', auth, adminOnly, deleteTable);
router.patch('/:id/toggle', auth, adminOnly, toggleTableStatus);

// QR Code
router.post('/:id/regenerate-qr', auth, adminOnly, regenerateQR);
router.post('/regenerate-all-qr', auth, adminOnly, regenerateAllQR);
router.get('/:id/qr-data', getQRDataUrl);
router.get('/:id/qr-print', getQRPrintCard);

module.exports = router;
