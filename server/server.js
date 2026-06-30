const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const os = require('os');
const fs = require('fs');
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
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      // Allow localhost and any 192.168.x.x (local network) in development
      if (
        origin.includes('localhost') ||
        origin.match(/^https?:\/\/192\.168\.\d+\.\d+/) ||
        origin.endsWith('.vercel.app') ||
        allowedOrigins.includes(origin)
      ) {
        return callback(null, true);
      }
      callback(new Error('Not allowed by CORS'));
    },
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
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    // Allow localhost and any 192.168.x.x (local network) in development
    if (
      origin.includes('localhost') ||
      origin.match(/^https?:\/\/192\.168\.\d+\.\d+/) ||
      origin.endsWith('.vercel.app') ||
      allowedOrigins.includes(origin)
    ) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (uploads) — gunakan UPLOAD_DIR env var untuk Railway Volume
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadDir));

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

// Network info — returns current local IP address
app.get('/api/network-info', (req, res) => {
  const ip = getLocalIPAddress();
  res.json({
    ip,
    client_url: `http://${ip}:5173`,
    server_url: `http://${ip}:${PORT}`,
  });
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

// --- Auto-detect local IP address ---
function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal (loopback) and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// File to track last known IP
const IP_CACHE_FILE = path.join(__dirname, '.last_ip');

function getLastKnownIP() {
  try {
    if (fs.existsSync(IP_CACHE_FILE)) {
      return fs.readFileSync(IP_CACHE_FILE, 'utf8').trim();
    }
  } catch (e) { /* ignore */ }
  return null;
}

function saveCurrentIP(ip) {
  try {
    fs.writeFileSync(IP_CACHE_FILE, ip, 'utf8');
  } catch (e) {
    console.error('[Network] Gagal menyimpan IP:', e.message);
  }
}

// Auto-regenerate QR codes if IP changed
async function autoRegenerateQRIfNeeded(currentIP) {
  const lastIP = getLastKnownIP();
  
  if (lastIP && lastIP !== currentIP) {
    console.log(`[Network] IP berubah: ${lastIP} → ${currentIP}`);
    console.log('[Network] Auto-regenerating semua QR code...');
    
    try {
      // Update CLIENT_URL environment variable dynamically
      process.env.CLIENT_URL = `http://${currentIP}:5173`;
      
      const { Table } = require('./models');
      const QRCode = require('qrcode');
      const UPLOAD_BASE = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');
      const QR_DIR = path.join(UPLOAD_BASE, 'qrcodes');
      if (!fs.existsSync(QR_DIR)) fs.mkdirSync(QR_DIR, { recursive: true });
      
      const tables = await Table.findAll();
      const clientUrl = process.env.CLIENT_URL;
      
      for (const table of tables) {
        // Delete old QR file
        if (table.qr_code) {
          const oldPath = path.join(UPLOAD_BASE, table.qr_code);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        
        // Generate new QR with updated IP
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
      }
      
      console.log(`[Network] ✓ QR code berhasil di-regenerate untuk ${tables.length} meja`);
    } catch (error) {
      console.error('[Network] Gagal auto-regenerate QR:', error.message);
    }
  } else if (!lastIP) {
    console.log(`[Network] IP pertama kali terdeteksi: ${currentIP}`);
    // Also update CLIENT_URL on first run
    process.env.CLIENT_URL = `http://${currentIP}:5173`;
  } else {
    console.log(`[Network] IP tidak berubah: ${currentIP}`);
    // Still update CLIENT_URL to match current IP
    process.env.CLIENT_URL = `http://${currentIP}:5173`;
  }
  
  saveCurrentIP(currentIP);
}

// Connect to database & start server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('[DB] Koneksi MySQL berhasil!');

    // Sync models (create tables if not exist)
    await sequelize.sync({ alter: false });
    console.log('[DB] Sinkronisasi model selesai.');

    // Auto-detect IP and regenerate QR if needed
    const currentIP = getLocalIPAddress();
    console.log(`[Network] IP Address terdeteksi: ${currentIP}`);
    await autoRegenerateQRIfNeeded(currentIP);

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`[Server] Ponbean API berjalan di http://${currentIP}:${PORT}`);
      console.log(`[Server] Client URL: ${process.env.CLIENT_URL}`);
    });
  } catch (error) {
    console.error('[DB] Gagal koneksi ke database:', error.message);
    process.exit(1);
  }
};

startServer();
