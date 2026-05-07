# ☕ Ponbean Coffee — Order System

Sistem pemesanan menu kafe berbasis **QR Code** yang memungkinkan pelanggan memesan langsung dari meja melalui smartphone. Dibangun sebagai projek skripsi menggunakan arsitektur **Full-Stack** dengan React dan Express.

---

## 📋 Deskripsi

**Ponbean Coffee Order System** adalah aplikasi web yang dirancang untuk mempermudah proses pemesanan di kafe. Pelanggan cukup memindai QR Code yang tersedia di setiap meja untuk mengakses menu digital, memilih item, dan melakukan pembayaran secara online melalui Midtrans. Pesanan yang masuk akan tampil secara real-time di dashboard kasir untuk diproses.

### Alur Kerja Sistem

```
┌─────────────┐    Scan QR     ┌─────────────┐    Pilih Menu    ┌─────────────┐
│  QR Code di │ ──────────────▶│  Halaman     │ ───────────────▶│  Keranjang   │
│    Meja     │                │  Menu        │                 │  Belanja     │
└─────────────┘                └─────────────┘                 └──────┬──────┘
                                                                      │
                                                                      ▼
┌─────────────┐   Real-time    ┌─────────────┐    Bayar via    ┌─────────────┐
│  Dashboard  │ ◀──────────────│  Pesanan     │ ◀──────────────│  Midtrans    │
│  Kasir      │   Socket.io    │  Masuk       │    Payment     │  Gateway     │
└──────┬──────┘                └─────────────┘                 └─────────────┘
       │
       ▼
┌─────────────┐                ┌─────────────┐
│  Proses &   │ ──────────────▶│  Pesanan     │
│  Selesaikan │   Update       │  Selesai ✅  │
└─────────────┘   Status       └─────────────┘
```

---

## ✨ Fitur Utama

### 👤 Sisi Pelanggan (Customer)
- **Scan QR Code** — Akses menu digital langsung dari smartphone
- **Katalog Menu** — Tampilan menu dengan kategori, gambar, deskripsi, dan harga
- **Keranjang Belanja** — Tambah/kurang item, catatan khusus
- **Pembayaran Online** — Integrasi Midtrans (QRIS, VA, e-Wallet, Kartu Kredit)
- **Tracking Pesanan** — Pantau status pesanan secara real-time

### 🧑‍💼 Sisi Admin
- **Dashboard** — Ringkasan statistik penjualan
- **Kelola Menu** — CRUD menu dengan upload gambar dan kategori
- **Kelola Meja** — Tambah/hapus meja dengan auto-generate QR Code
- **Kelola User** — Manajemen akun admin dan kasir
- **Laporan Penjualan** — Rekap penjualan harian/mingguan/bulanan dengan menu terlaris

### 💰 Sisi Kasir
- **Pesanan Masuk** — Terima pesanan real-time via Socket.io
- **Update Status** — Ubah status: Menunggu Bayar → Dibayar → Diproses → Selesai
- **Cetak Struk** — Print struk thermal 80mm
- **Riwayat Pesanan** — Lihat histori semua transaksi

---

## 🛠️ Tech Stack

### Frontend (Client)
| Teknologi | Keterangan |
|-----------|------------|
| **React 19** | Library UI |
| **Vite 8** | Build tool & dev server |
| **React Router v7** | Client-side routing |
| **Axios** | HTTP client untuk API |
| **Socket.io Client** | Komunikasi real-time |
| **React Hot Toast** | Notifikasi toast |
| **React Icons** | Icon library (Material Design) |
| **QRCode.react** | Render QR Code di frontend |

### Backend (Server)
| Teknologi | Keterangan |
|-----------|------------|
| **Express.js** | Web framework |
| **Sequelize** | ORM untuk MySQL |
| **MySQL** | Database relasional |
| **Socket.io** | WebSocket untuk real-time |
| **Midtrans Client** | Payment gateway |
| **JWT** | Autentikasi token |
| **Multer** | Upload file/gambar |
| **bcryptjs** | Hashing password |
| **QRCode** | Generate QR Code sebagai file PNG |

---

## 📁 Struktur Projek

```
aplikasi-order-menu/
├── client/                    # Frontend React + Vite
│   ├── public/                # Static assets
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── CartDrawer.jsx
│   │   │   ├── KasirLayout.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── context/           # React Context (state management)
│   │   │   ├── AuthContext.jsx
│   │   │   └── CartContext.jsx
│   │   ├── pages/
│   │   │   ├── customer/      # Halaman pelanggan
│   │   │   │   ├── MenuPage.jsx
│   │   │   │   └── OrderStatusPage.jsx
│   │   │   ├── admin/         # Halaman admin
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── MenuManagement.jsx
│   │   │   │   ├── TableManagement.jsx
│   │   │   │   ├── LaporanPenjualan.jsx
│   │   │   │   └── UserManagement.jsx
│   │   │   ├── kasir/         # Halaman kasir
│   │   │   │   ├── KasirDashboard.jsx
│   │   │   │   └── KasirHistory.jsx
│   │   │   └── Login.jsx
│   │   ├── services/          # API service layer
│   │   │   └── api.js
│   │   ├── utils/             # Helper functions
│   │   │   └── helpers.js
│   │   ├── App.jsx            # Root component & routing
│   │   ├── main.jsx           # Entry point
│   │   └── index.css          # Global styles
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                    # Backend Express.js
│   ├── config/
│   │   ├── db.js              # Koneksi Sequelize + MySQL
│   │   ├── midtrans.js        # Konfigurasi Midtrans
│   │   └── createDb.js        # Script buat database
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── menuController.js
│   │   ├── orderController.js
│   │   ├── paymentController.js
│   │   ├── reportController.js
│   │   └── tableController.js
│   ├── middleware/
│   │   ├── auth.js            # JWT authentication
│   │   └── upload.js          # Multer file upload
│   ├── models/                # Sequelize models
│   │   ├── User.js
│   │   ├── Category.js
│   │   ├── Menu.js
│   │   ├── Table.js
│   │   ├── Order.js
│   │   ├── OrderItem.js
│   │   └── index.js           # Model associations
│   ├── routes/                # API routes
│   ├── seeders/
│   │   └── seed.js            # Data awal (menu, user, meja)
│   ├── uploads/               # File upload & QR codes
│   ├── server.js              # Entry point server
│   ├── .env.example           # Template environment variables
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🗄️ Database Schema

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   categories │     │    menus     │     │  order_items  │
├──────────────┤     ├──────────────┤     ├──────────────┤
│ id           │◀───┐│ id           │◀───┐│ id           │
│ nama         │    ││ category_id  │───┘ │ order_id     │───┐
│ icon         │    ││ nama         │     │ menu_id      │───┘
│ created_at   │    ││ deskripsi    │     │ quantity     │
│ updated_at   │    ││ harga        │     │ price        │
└──────────────┘    ││ gambar       │     │ subtotal     │
                    ││ is_available │     │ note         │
                    ││ created_at   │     └──────┬───────┘
                    ││ updated_at   │            │
                    │└──────────────┘            │
                    │                            │
┌──────────────┐    │ ┌──────────────┐           │
│    users     │    │ │   orders     │◀──────────┘
├──────────────┤    │ ├──────────────┤
│ id           │    │ │ id           │
│ nama         │    │ │ order_number │
│ username     │    │ │ table_id     │───┐
│ password     │    │ │ customer_name│   │
│ role         │    │ │ status       │   │
│ created_at   │    │ │ total_amount │   │
│ updated_at   │    │ │ payment_id   │   │
└──────────────┘    │ │ payment_method   │
                    │ │ note         │   │
                    │ │ created_at   │   │
                    │ │ updated_at   │   │
                    │ └──────────────┘   │
                    │                    │
                    │ ┌──────────────┐   │
                    │ │   tables     │◀──┘
                    │ ├──────────────┤
                    │ │ id           │
                    └─│ nomor_meja   │
                      │ qr_code     │
                      │ is_active    │
                      │ created_at   │
                      │ updated_at   │
                      └──────────────┘
```

---

## 🚀 Instalasi & Menjalankan

### Prasyarat

- **Node.js** v18+ dan **npm**
- **MySQL** (via [Laragon](https://laragon.org/), XAMPP, atau standalone)
- **Akun Midtrans Sandbox** — [Daftar gratis di sini](https://dashboard.sandbox.midtrans.com)

### 1. Clone Repository

```bash
git clone https://github.com/Jekmerson/order-menu-ponbean.git
cd order-menu-ponbean
```

### 2. Setup Server (Backend)

```bash
cd server
npm install
```

Buat file `.env` berdasarkan template:

```bash
cp .env.example .env
```

Edit file `.env` dan isi dengan konfigurasi Anda:

```env
# Server
PORT=5000
NODE_ENV=development

# Database (MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=
DB_NAME=ponbean_db

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# Midtrans Sandbox
MIDTRANS_SERVER_KEY=your_midtrans_server_key
MIDTRANS_CLIENT_KEY=your_midtrans_client_key
MIDTRANS_IS_PRODUCTION=false

# Client URL
CLIENT_URL=http://localhost:5173
```

### 3. Buat Database & Seed Data Awal

Pastikan MySQL sudah berjalan, lalu buat database `ponbean_db`:

```sql
CREATE DATABASE ponbean_db;
```

Jalankan seeder untuk mengisi data awal (menu, user, meja):

```bash
npm run db:seed
```

### 4. Setup Client (Frontend)

```bash
cd ../client
npm install
```

### 5. Jalankan Aplikasi

**Terminal 1 — Server:**
```bash
cd server
npm run dev
```
Server akan berjalan di `http://localhost:5000`

**Terminal 2 — Client:**
```bash
cd client
npm run dev
```
Client akan berjalan di `http://localhost:5173`

---

## 🔑 Akun Default (Setelah Seeding)

| Role | Username | Password |
|------|----------|----------|
| **Admin** | `admin` | `admin123` |
| **Kasir** | `kasir1` | `kasir123` |

---

## 📱 Akses dari Smartphone (Jaringan Lokal)

Untuk mengakses aplikasi dari smartphone agar bisa scan QR Code:

1. Pastikan **komputer dan smartphone terhubung ke WiFi yang sama**

2. Cek IP komputer:
   ```bash
   # Windows
   ipconfig
   
   # Mac/Linux
   ifconfig
   ```

3. Update konfigurasi agar menggunakan IP jaringan:

   **`client/vite.config.js`** — tambahkan:
   ```js
   server: {
     host: '0.0.0.0',
     port: 5173,
   }
   ```

   **`server/.env`** — ubah:
   ```env
   CLIENT_URL=http://IP_KOMPUTER_ANDA:5173
   ```

   **`client/.env`** — buat file baru:
   ```env
   VITE_API_URL=http://IP_KOMPUTER_ANDA:5000/api
   VITE_UPLOADS_URL=http://IP_KOMPUTER_ANDA:5000/uploads
   ```

4. Restart server & client, lalu **regenerate semua QR Code** dari panel admin

5. Scan QR Code dari smartphone — sekarang akan mengarah ke IP yang benar

---

## 🔗 API Endpoints

### Auth
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| `POST` | `/api/auth/login` | Login user |
| `GET` | `/api/auth/profile` | Profil user (auth) |
| `GET` | `/api/auth/users` | Daftar semua user (admin) |
| `POST` | `/api/auth/users` | Buat user baru (admin) |
| `DELETE` | `/api/auth/users/:id` | Hapus user (admin) |

### Menu
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| `GET` | `/api/menus` | Semua menu |
| `GET` | `/api/menus/:id` | Detail menu |
| `POST` | `/api/menus` | Tambah menu (admin) |
| `PUT` | `/api/menus/:id` | Edit menu (admin) |
| `DELETE` | `/api/menus/:id` | Hapus menu (admin) |
| `PATCH` | `/api/menus/:id/toggle` | Toggle ketersediaan |
| `GET` | `/api/menus/categories` | Daftar kategori |
| `POST` | `/api/menus/categories` | Tambah kategori |

### Order
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| `POST` | `/api/orders` | Buat pesanan (customer) |
| `GET` | `/api/orders` | Semua pesanan (kasir/admin) |
| `GET` | `/api/orders/:id` | Detail pesanan |
| `PATCH` | `/api/orders/:id/status` | Update status pesanan |

### Table
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| `GET` | `/api/tables` | Semua meja |
| `POST` | `/api/tables` | Tambah meja + generate QR |
| `DELETE` | `/api/tables/:id` | Hapus meja |
| `PATCH` | `/api/tables/:id/toggle` | Toggle status aktif |
| `POST` | `/api/tables/:id/regenerate-qr` | Generate ulang QR |
| `POST` | `/api/tables/regenerate-all-qr` | Generate ulang semua QR |

### Payment
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| `POST` | `/api/payment/create` | Buat pembayaran Midtrans |
| `POST` | `/api/payment/notification` | Webhook notifikasi Midtrans |
| `GET` | `/api/payment/status/:orderId` | Cek status pembayaran |

### Report
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| `GET` | `/api/reports` | Laporan penjualan |

---

## 🔌 WebSocket Events

| Event | Arah | Keterangan |
|-------|------|------------|
| `new_order` | Server → Client | Pesanan baru masuk |
| `order_updated` | Server → Client | Status pesanan berubah |

---

## 📄 Lisensi

Projek ini dibuat untuk keperluan **Tugas Akhir / Skripsi**.

---

## 👨‍💻 Author

**Jay** — [Jekmerson](https://github.com/Jekmerson)
