const express = require('express');
const router = express.Router();
const { login, getProfile, getUsers, createUser, deleteUser } = require('../controllers/authController');
const { auth, adminOnly } = require('../middleware/auth');

router.post('/login', login);
router.get('/profile', auth, getProfile);
router.get('/users', auth, adminOnly, getUsers);
router.post('/users', auth, adminOnly, createUser);
router.delete('/users/:id', auth, adminOnly, deleteUser);

module.exports = router;
