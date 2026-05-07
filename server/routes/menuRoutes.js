const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getAllMenus, getMenuById, createMenu, updateMenu, deleteMenu, toggleAvailability,
  getAllCategories, createCategory, updateCategory, deleteCategory,
} = require('../controllers/menuController');

// Public routes (for customers)
router.get('/', getAllMenus);
router.get('/categories', getAllCategories);
router.get('/:id', getMenuById);

// Admin routes
router.post('/', auth, adminOnly, upload.single('gambar'), createMenu);
router.put('/:id', auth, adminOnly, upload.single('gambar'), updateMenu);
router.delete('/:id', auth, adminOnly, deleteMenu);
router.patch('/:id/toggle', auth, adminOnly, toggleAvailability);

// Category routes (admin)
router.post('/categories', auth, adminOnly, createCategory);
router.put('/categories/:id', auth, adminOnly, updateCategory);
router.delete('/categories/:id', auth, adminOnly, deleteCategory);

module.exports = router;
