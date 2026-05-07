const { Menu, Category } = require('../models');
const path = require('path');
const fs = require('fs');

// Get all menus (public - for customer)
const getAllMenus = async (req, res) => {
  try {
    const where = {};
    if (req.query.available === 'true') {
      where.is_available = true;
    }
    if (req.query.category_id) {
      where.category_id = req.query.category_id;
    }

    const menus = await Menu.findAll({
      where,
      include: [{ model: Category, as: 'category', attributes: ['id', 'nama', 'icon'] }],
      order: [['category_id', 'ASC'], ['nama', 'ASC']],
    });
    res.json(menus);
  } catch (error) {
    console.error('Get menus error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// Get single menu
const getMenuById = async (req, res) => {
  try {
    const menu = await Menu.findByPk(req.params.id, {
      include: [{ model: Category, as: 'category' }],
    });
    if (!menu) {
      return res.status(404).json({ message: 'Menu tidak ditemukan.' });
    }
    res.json(menu);
  } catch (error) {
    console.error('Get menu error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// Create menu (admin only)
const createMenu = async (req, res) => {
  try {
    const { nama, category_id, deskripsi, harga, is_available } = req.body;

    if (!nama || !category_id || !harga) {
      return res.status(400).json({ message: 'Nama, kategori, dan harga harus diisi.' });
    }

    const menuData = {
      nama,
      category_id,
      deskripsi: deskripsi || '',
      harga,
      is_available: is_available !== undefined ? is_available : true,
    };

    if (req.file) {
      menuData.gambar = req.file.filename;
    }

    const menu = await Menu.create(menuData);
    const menuWithCategory = await Menu.findByPk(menu.id, {
      include: [{ model: Category, as: 'category' }],
    });

    res.status(201).json({ message: 'Menu berhasil ditambahkan', menu: menuWithCategory });
  } catch (error) {
    console.error('Create menu error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// Update menu (admin only)
const updateMenu = async (req, res) => {
  try {
    const menu = await Menu.findByPk(req.params.id);
    if (!menu) {
      return res.status(404).json({ message: 'Menu tidak ditemukan.' });
    }

    const { nama, category_id, deskripsi, harga, is_available } = req.body;

    if (nama) menu.nama = nama;
    if (category_id) menu.category_id = category_id;
    if (deskripsi !== undefined) menu.deskripsi = deskripsi;
    if (harga) menu.harga = harga;
    if (is_available !== undefined) menu.is_available = is_available === 'true' || is_available === true;

    // Handle image update
    if (req.file) {
      // Delete old image
      if (menu.gambar) {
        const oldPath = path.join(__dirname, '..', 'uploads', menu.gambar);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      menu.gambar = req.file.filename;
    }

    await menu.save();
    const updatedMenu = await Menu.findByPk(menu.id, {
      include: [{ model: Category, as: 'category' }],
    });

    res.json({ message: 'Menu berhasil diperbarui', menu: updatedMenu });
  } catch (error) {
    console.error('Update menu error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// Delete menu (admin only)
const deleteMenu = async (req, res) => {
  try {
    const menu = await Menu.findByPk(req.params.id);
    if (!menu) {
      return res.status(404).json({ message: 'Menu tidak ditemukan.' });
    }

    // Delete image file
    if (menu.gambar) {
      const imgPath = path.join(__dirname, '..', 'uploads', menu.gambar);
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }
    }

    await menu.destroy();
    res.json({ message: 'Menu berhasil dihapus.' });
  } catch (error) {
    console.error('Delete menu error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// Toggle availability
const toggleAvailability = async (req, res) => {
  try {
    const menu = await Menu.findByPk(req.params.id);
    if (!menu) {
      return res.status(404).json({ message: 'Menu tidak ditemukan.' });
    }

    menu.is_available = !menu.is_available;
    await menu.save();

    res.json({ message: `Menu ${menu.is_available ? 'tersedia' : 'tidak tersedia'}`, menu });
  } catch (error) {
    console.error('Toggle availability error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// ===== Categories =====
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [{ model: Menu, as: 'menus', attributes: ['id'] }],
      order: [['id', 'ASC']],
    });
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

const createCategory = async (req, res) => {
  try {
    const { nama, icon } = req.body;
    if (!nama) {
      return res.status(400).json({ message: 'Nama kategori harus diisi.' });
    }
    const category = await Category.create({ nama, icon: icon || '🍽️' });
    res.status(201).json({ message: 'Kategori berhasil ditambahkan', category });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Kategori tidak ditemukan.' });
    }
    const { nama, icon } = req.body;
    if (nama) category.nama = nama;
    if (icon) category.icon = icon;
    await category.save();
    res.json({ message: 'Kategori berhasil diperbarui', category });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id, {
      include: [{ model: Menu, as: 'menus' }],
    });
    if (!category) {
      return res.status(404).json({ message: 'Kategori tidak ditemukan.' });
    }
    if (category.menus && category.menus.length > 0) {
      return res.status(400).json({ message: 'Kategori tidak bisa dihapus karena masih memiliki menu.' });
    }
    await category.destroy();
    res.json({ message: 'Kategori berhasil dihapus.' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

module.exports = {
  getAllMenus,
  getMenuById,
  createMenu,
  updateMenu,
  deleteMenu,
  toggleAvailability,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
