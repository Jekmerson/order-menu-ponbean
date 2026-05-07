const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Login
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username dan password harus diisi.' });
    }

    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: 'Username atau password salah.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Username atau password salah.' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, nama: user.nama, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Login berhasil',
      token,
      user: {
        id: user.id,
        nama: user.nama,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
    });
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan.' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// Get all users (admin only)
const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']],
    });
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// Create user (admin only)
const createUser = async (req, res) => {
  try {
    const { nama, username, password, role } = req.body;

    if (!nama || !username || !password) {
      return res.status(400).json({ message: 'Nama, username, dan password harus diisi.' });
    }

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: 'Username sudah digunakan.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      nama,
      username,
      password: hashedPassword,
      role: role || 'kasir',
    });

    res.status(201).json({
      message: 'User berhasil dibuat',
      user: {
        id: user.id,
        nama: user.nama,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// Delete user (admin only)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: 'Tidak bisa menghapus akun sendiri.' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan.' });
    }

    await user.destroy();
    res.json({ message: 'User berhasil dihapus.' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

module.exports = { login, getProfile, getUsers, createUser, deleteUser };
