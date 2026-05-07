const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
require('dotenv').config();

const { sequelize } = require('./models');

// Import routes
const authRoutes = require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const tableRoutes = require('./routes/tableRoutes');
const reportRoutes = require('./routes/reportRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();
const server = http.createServer(app);

// Socket.io setup
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
  },
});

// Make io accessible in controllers
app.set('io', io);

// Socket connection
io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/payment', paymentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Ponbean API is running' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.name === 'MulterError') {
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }
  res.status(500).json({ message: 'Terjadi kesalahan server.' });
});

const PORT = process.env.PORT || 5000;

// Connect to database & start server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('[DB] Koneksi MySQL berhasil!');

    // Sync models (create tables if not exist)
    await sequelize.sync({ alter: false });
    console.log('[DB] Sinkronisasi model selesai.');

    server.listen(PORT, () => {
      console.log(`[Server] Ponbean API berjalan di http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('[DB] Gagal koneksi ke database:', error.message);
    process.exit(1);
  }
};

startServer();
// Midtrans keys updated
