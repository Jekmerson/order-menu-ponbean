# I. Spesifikasi File

Dalam membangun aplikasi web ini penulis menggunakan sebuah database bernama **ponbean_db**, terdiri atas beberapa file yang digunakan untuk Aplikasi Order Menu Ponbean. File-file yang digunakan sebagai berikut:

---

## 1. Spesifikasi File Tabel Users

| | |
|---|---|
| **Nama File** | : Tabel Users |
| **Akronim** | : users |
| **Fungsi** | : Untuk menyimpan data pengguna (admin & kasir) |
| **Tipe File** | : File master |
| **Organisasi File** | : Indexed Sequential |
| **Akses File** | : Random |
| **Media** | : Harddisk |
| **Panjang Record** | : 412 Karakter |
| **Kunci Field** | : id |
| **Software** | : MySQL |

**Tabel I.1 — Spesifikasi File Tabel Users**

| No | Elemen Data | Nama Field | Type | Size | Keterangan |
|----|-------------|------------|------|------|------------|
| 1 | Id | id | Int | 11 | Primary Key |
| 2 | Nama | nama | Varchar | 100 | - |
| 3 | Username | username | Varchar | 50 | Unique |
| 4 | Password | password | Varchar | 255 | - |
| 5 | Role | role | Enum | - | admin / kasir |
| 6 | Dibuat pada | created_at | Datetime | - | Timestamps |
| 7 | Diperbarui pada | updated_at | Datetime | - | Timestamps |

---

## 2. Spesifikasi File Tabel Categories

| | |
|---|---|
| **Nama File** | : Tabel Categories |
| **Akronim** | : categories |
| **Fungsi** | : Untuk menyimpan data kategori menu |
| **Tipe File** | : File master |
| **Organisasi File** | : Indexed Sequential |
| **Akses File** | : Random |
| **Media** | : Harddisk |
| **Panjang Record** | : 157 Karakter |
| **Kunci Field** | : id |
| **Software** | : MySQL |

**Tabel I.2 — Spesifikasi File Tabel Categories**

| No | Elemen Data | Nama Field | Type | Size | Keterangan |
|----|-------------|------------|------|------|------------|
| 1 | Id | id | Int | 11 | Primary Key |
| 2 | Nama | nama | Varchar | 100 | - |
| 3 | Icon | icon | Varchar | 50 | Default 🍽️ |
| 4 | Dibuat pada | created_at | Datetime | - | Timestamps |
| 5 | Diperbarui pada | updated_at | Datetime | - | Timestamps |

---

## 3. Spesifikasi File Tabel Menus

| | |
|---|---|
| **Nama File** | : Tabel Menus |
| **Akronim** | : menus |
| **Fungsi** | : Untuk menyimpan data menu makanan dan minuman |
| **Tipe File** | : File master |
| **Organisasi File** | : Indexed Sequential |
| **Akses File** | : Random |
| **Media** | : Harddisk |
| **Panjang Record** | : 523 Karakter |
| **Kunci Field** | : id |
| **Software** | : MySQL |

**Tabel I.3 — Spesifikasi File Tabel Menus**

| No | Elemen Data | Nama Field | Type | Size | Keterangan |
|----|-------------|------------|------|------|------------|
| 1 | Id | id | Int | 11 | Primary Key |
| 2 | Id Kategori | category_id | Int | 11 | Foreign Key → categories.id |
| 3 | Nama | nama | Varchar | 150 | - |
| 4 | Deskripsi | deskripsi | Text | - | - |
| 5 | Harga | harga | Decimal | 10 | - |
| 6 | Gambar | gambar | Varchar | 255 | - |
| 7 | Ketersediaan | is_available | Boolean | 1 | Default true |
| 8 | Dibuat pada | created_at | Datetime | - | Timestamps |
| 9 | Diperbarui pada | updated_at | Datetime | - | Timestamps |

---

## 4. Spesifikasi File Tabel Tables

| | |
|---|---|
| **Nama File** | : Tabel Tables |
| **Akronim** | : tables |
| **Fungsi** | : Untuk menyimpan data meja restoran |
| **Tipe File** | : File master |
| **Organisasi File** | : Indexed Sequential |
| **Akses File** | : Random |
| **Media** | : Harddisk |
| **Panjang Record** | : 273 Karakter |
| **Kunci Field** | : id |
| **Software** | : MySQL |

**Tabel I.4 — Spesifikasi File Tabel Tables**

| No | Elemen Data | Nama Field | Type | Size | Keterangan |
|----|-------------|------------|------|------|------------|
| 1 | Id | id | Int | 11 | Primary Key |
| 2 | Nomor Meja | nomor_meja | Int | 11 | Unique |
| 3 | QR Code | qr_code | Varchar | 255 | - |
| 4 | Status Aktif | is_active | Boolean | 1 | Default true |
| 5 | Dibuat pada | created_at | Datetime | - | Timestamps |
| 6 | Diperbarui pada | updated_at | Datetime | - | Timestamps |

---

## 5. Spesifikasi File Tabel Orders

| | |
|---|---|
| **Nama File** | : Tabel Orders |
| **Akronim** | : orders |
| **Fungsi** | : Untuk menyimpan data pesanan pelanggan |
| **Tipe File** | : File transaksi |
| **Organisasi File** | : Indexed Sequential |
| **Akses File** | : Random |
| **Media** | : Harddisk |
| **Panjang Record** | : 329 Karakter |
| **Kunci Field** | : id |
| **Software** | : MySQL |

**Tabel I.5 — Spesifikasi File Tabel Orders**

| No | Elemen Data | Nama Field | Type | Size | Keterangan |
|----|-------------|------------|------|------|------------|
| 1 | Id | id | Int | 11 | Primary Key |
| 2 | Nomor Pesanan | order_number | Varchar | 30 | Unique |
| 3 | Id Meja | table_id | Int | 11 | Foreign Key → tables.id |
| 4 | Nama Pelanggan | customer_name | Varchar | 100 | - |
| 5 | Status | status | Enum | - | pending_payment / paid / processing / completed / cancelled |
| 6 | Metode Pembayaran | payment_method | Varchar | 50 | - |
| 7 | Id Pembayaran | payment_id | Varchar | 100 | - |
| 8 | Total | total_amount | Decimal | 12 | Default 0 |
| 9 | Catatan | note | Text | - | - |
| 10 | Dibuat pada | created_at | Datetime | - | Timestamps |
| 11 | Diperbarui pada | updated_at | Datetime | - | Timestamps |

---

## 6. Spesifikasi File Tabel Order Items

| | |
|---|---|
| **Nama File** | : Tabel Order Items |
| **Akronim** | : order_items |
| **Fungsi** | : Untuk menyimpan detail item pada setiap pesanan |
| **Tipe File** | : File transaksi |
| **Organisasi File** | : Indexed Sequential |
| **Akses File** | : Random |
| **Media** | : Harddisk |
| **Panjang Record** | : 60 Karakter |
| **Kunci Field** | : id |
| **Software** | : MySQL |

**Tabel I.6 — Spesifikasi File Tabel Order Items**

| No | Elemen Data | Nama Field | Type | Size | Keterangan |
|----|-------------|------------|------|------|------------|
| 1 | Id | id | Int | 11 | Primary Key |
| 2 | Id Pesanan | order_id | Int | 11 | Foreign Key → orders.id |
| 3 | Id Menu | menu_id | Int | 11 | Foreign Key → menus.id |
| 4 | Jumlah | quantity | Int | 11 | Default 1 |
| 5 | Harga | price | Decimal | 10 | - |
| 6 | Subtotal | subtotal | Decimal | 12 | - |
| 7 | Catatan | note | Text | - | - |
| 8 | Dibuat pada | created_at | Datetime | - | Timestamps |
| 9 | Diperbarui pada | updated_at | Datetime | - | Timestamps |
