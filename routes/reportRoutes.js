const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');
const { getReport } = require('../controllers/reportController');

router.get('/', auth, adminOnly, getReport);

module.exports = router;
