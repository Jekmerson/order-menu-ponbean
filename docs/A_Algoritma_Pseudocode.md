# A. Algoritma Pseudocode

## Sistem Pemesanan Menu Kafe Ponbean Coffee

---

## 1. Algoritma Autentikasi (Authentication)

### 1.1 Login

```
ALGORITMA Login

INPUT: username, password
OUTPUT: token JWT, data user

BEGIN
    IF username KOSONG OR password KOSONG THEN
        RETURN Error("Username dan password harus diisi")
    END IF

    user ← CARI User DIMANA username = input.username

    IF user TIDAK DITEMUKAN THEN
        RETURN Error("Username atau password salah")
    END IF

    isMatch ← BANDINGKAN(password, user.password_hash)

    IF isMatch = FALSE THEN
        RETURN Error("Username atau password salah")
    END IF

    payload ← {
        id: user.id,
        username: user.username,
        nama: user.nama,
        role: user.role
    }

    token ← JWT_SIGN(payload, SECRET_KEY, expires_in = "7d")

    RETURN {
        message: "Login berhasil",
        token: token,
        user: { id, nama, username, role }
    }
END
```

### 1.2 Verifikasi Token (Middleware Auth)

```
ALGORITMA VerifikasiToken

INPUT: HTTP Request (dengan header Authorization)
OUTPUT: Request dilanjutkan atau ditolak

BEGIN
    authHeader ← request.headers.authorization

    IF authHeader KOSONG OR TIDAK DIMULAI DENGAN "Bearer " THEN
        RETURN Error(401, "Akses ditolak. Token tidak ditemukan.")
    END IF

    token ← AMBIL_BAGIAN(authHeader, setelah "Bearer ")

    TRY
        decoded ← JWT_VERIFY(token, SECRET_KEY)
        request.user ← decoded
        LANJUTKAN ke handler berikutnya
    CATCH error
        RETURN Error(401, "Token tidak valid atau sudah expired.")
    END TRY
END
```

### 1.3 Otorisasi Admin Only

```
ALGORITMA AdminOnly

INPUT: HTTP Request (dengan data user dari middleware auth)
OUTPUT: Request dilanjutkan atau ditolak

BEGIN
    IF request.user.role ≠ "admin" THEN
        RETURN Error(403, "Akses ditolak. Hanya admin yang bisa mengakses.")
    END IF

    LANJUTKAN ke handler berikutnya
END
```

### 1.4 Buat User Baru

```
ALGORITMA CreateUser

INPUT: nama, username, password, role
OUTPUT: Data user baru

BEGIN
    IF nama KOSONG OR username KOSONG OR password KOSONG THEN
        RETURN Error("Nama, username, dan password harus diisi")
    END IF

    existingUser ← CARI User DIMANA username = input.username

    IF existingUser DITEMUKAN THEN
        RETURN Error("Username sudah digunakan")
    END IF

    hashedPassword ← BCRYPT_HASH(password, salt_rounds = 10)

    user ← BUAT User {
        nama: nama,
        username: username,
        password: hashedPassword,
        role: role ATAU "kasir"
    }

    RETURN { message: "User berhasil dibuat", user: { id, nama, username, role } }
END
```

### 1.5 Hapus User

```
ALGORITMA DeleteUser

INPUT: user_id (dari parameter URL), current_user (dari token)
OUTPUT: Konfirmasi penghapusan

BEGIN
    IF user_id = current_user.id THEN
        RETURN Error("Tidak bisa menghapus akun sendiri")
    END IF

    user ← CARI User BERDASARKAN id = user_id

    IF user TIDAK DITEMUKAN THEN
        RETURN Error("User tidak ditemukan")
    END IF

    HAPUS user

    RETURN { message: "User berhasil dihapus" }
END
```

---

## 2. Algoritma Manajemen Menu

### 2.1 Ambil Semua Menu

```
ALGORITMA GetAllMenus

INPUT: query parameters (available, category_id)
OUTPUT: Daftar menu

BEGIN
    filter ← {}

    IF parameter.available = "true" THEN
        filter.is_available ← TRUE
    END IF

    IF parameter.category_id ADA THEN
        filter.category_id ← parameter.category_id
    END IF

    menus ← AMBIL SEMUA Menu
                DIMANA filter
                SERTAKAN data Category (id, nama, icon)
                URUTKAN BERDASARKAN category_id ASC, nama ASC

    RETURN menus
END
```

### 2.2 Tambah Menu Baru

```
ALGORITMA CreateMenu

INPUT: nama, category_id, deskripsi, harga, is_available, file gambar
OUTPUT: Data menu baru

BEGIN
    IF nama KOSONG OR category_id KOSONG OR harga KOSONG THEN
        RETURN Error("Nama, kategori, dan harga harus diisi")
    END IF

    menuData ← {
        nama: nama,
        category_id: category_id,
        deskripsi: deskripsi ATAU "",
        harga: harga,
        is_available: is_available ATAU TRUE
    }

    IF file gambar ADA THEN
        menuData.gambar ← file.filename
    END IF

    menu ← BUAT Menu(menuData)

    menuWithCategory ← AMBIL Menu BERDASARKAN menu.id
                        SERTAKAN data Category

    RETURN { message: "Menu berhasil ditambahkan", menu: menuWithCategory }
END
```

### 2.3 Update Menu

```
ALGORITMA UpdateMenu

INPUT: menu_id, nama, category_id, deskripsi, harga, is_available, file gambar
OUTPUT: Data menu yang diperbarui

BEGIN
    menu ← CARI Menu BERDASARKAN id = menu_id

    IF menu TIDAK DITEMUKAN THEN
        RETURN Error("Menu tidak ditemukan")
    END IF

    IF nama ADA THEN menu.nama ← nama
    IF category_id ADA THEN menu.category_id ← category_id
    IF deskripsi ADA THEN menu.deskripsi ← deskripsi
    IF harga ADA THEN menu.harga ← harga
    IF is_available ADA THEN menu.is_available ← is_available

    IF file gambar baru ADA THEN
        IF menu.gambar LAMA ADA THEN
            oldPath ← GABUNG(upload_dir, menu.gambar)
            IF FILE_EXISTS(oldPath) THEN
                HAPUS_FILE(oldPath)
            END IF
        END IF
        menu.gambar ← file.filename
    END IF

    SIMPAN menu

    updatedMenu ← AMBIL Menu BERDASARKAN menu.id SERTAKAN Category

    RETURN { message: "Menu berhasil diperbarui", menu: updatedMenu }
END
```

### 2.4 Hapus Menu

```
ALGORITMA DeleteMenu

INPUT: menu_id
OUTPUT: Konfirmasi penghapusan

BEGIN
    menu ← CARI Menu BERDASARKAN id = menu_id

    IF menu TIDAK DITEMUKAN THEN
        RETURN Error("Menu tidak ditemukan")
    END IF

    IF menu.gambar ADA THEN
        imgPath ← GABUNG(upload_dir, menu.gambar)
        IF FILE_EXISTS(imgPath) THEN
            HAPUS_FILE(imgPath)
        END IF
    END IF

    HAPUS menu

    RETURN { message: "Menu berhasil dihapus" }
END
```

### 2.5 Toggle Ketersediaan Menu

```
ALGORITMA ToggleAvailability

INPUT: menu_id
OUTPUT: Status ketersediaan baru

BEGIN
    menu ← CARI Menu BERDASARKAN id = menu_id

    IF menu TIDAK DITEMUKAN THEN
        RETURN Error("Menu tidak ditemukan")
    END IF

    menu.is_available ← NOT menu.is_available
    SIMPAN menu

    IF menu.is_available = TRUE THEN
        pesan ← "Menu tersedia"
    ELSE
        pesan ← "Menu tidak tersedia"
    END IF

    RETURN { message: pesan, menu: menu }
END
```

---

## 3. Algoritma Manajemen Kategori

### 3.1 Tambah Kategori

```
ALGORITMA CreateCategory

INPUT: nama, icon
OUTPUT: Data kategori baru

BEGIN
    IF nama KOSONG THEN
        RETURN Error("Nama kategori harus diisi")
    END IF

    category ← BUAT Category {
        nama: nama,
        icon: icon ATAU "🍽️"
    }

    RETURN { message: "Kategori berhasil ditambahkan", category }
END
```

### 3.2 Hapus Kategori

```
ALGORITMA DeleteCategory

INPUT: category_id
OUTPUT: Konfirmasi penghapusan

BEGIN
    category ← CARI Category BERDASARKAN id = category_id
                SERTAKAN daftar Menu terkait

    IF category TIDAK DITEMUKAN THEN
        RETURN Error("Kategori tidak ditemukan")
    END IF

    IF category.menus TIDAK KOSONG THEN
        RETURN Error("Kategori tidak bisa dihapus karena masih memiliki menu")
    END IF

    HAPUS category

    RETURN { message: "Kategori berhasil dihapus" }
END
```

---

## 4. Algoritma Pemesanan (Order)

### 4.1 Generate Nomor Pesanan

```
ALGORITMA GenerateOrderNumber

INPUT: -
OUTPUT: Nomor pesanan unik (format: ORD-YYYYMMDD-XXX)

BEGIN
    today ← TANGGAL_SEKARANG()
    dateStr ← FORMAT(today, "YYYYMMDD")
    prefix ← "ORD-" + dateStr + "-"

    lastOrder ← CARI Order TERAKHIR
                    DIMANA order_number SEPERTI prefix + "%"
                    URUTKAN order_number DESC

    IF lastOrder DITEMUKAN THEN
        lastNum ← AMBIL angka terakhir dari lastOrder.order_number
        nextNum ← lastNum + 1
    ELSE
        nextNum ← 1
    END IF

    orderNumber ← prefix + PAD_LEFT(nextNum, 3, "0")

    RETURN orderNumber
END
```

### 4.2 Buat Pesanan Baru

```
ALGORITMA CreateOrder

INPUT: table_id, customer_name, items[], note
OUTPUT: Data pesanan lengkap

BEGIN
    IF table_id KOSONG OR items KOSONG THEN
        RETURN Error("Meja dan item pesanan harus diisi")
    END IF

    // Validasi meja
    table ← CARI Table BERDASARKAN id = table_id

    IF table TIDAK DITEMUKAN OR table.is_active = FALSE THEN
        RETURN Error("Meja tidak valid atau tidak aktif")
    END IF

    // Kalkulasi total dan validasi item
    totalAmount ← 0
    orderItems ← []

    UNTUK SETIAP item DALAM items:
        menu ← CARI Menu BERDASARKAN id = item.menu_id

        IF menu TIDAK DITEMUKAN THEN
            RETURN Error("Menu dengan ID " + item.menu_id + " tidak ditemukan")
        END IF

        IF menu.is_available = FALSE THEN
            RETURN Error("Menu '" + menu.nama + "' sedang tidak tersedia")
        END IF

        subtotal ← menu.harga × item.quantity
        totalAmount ← totalAmount + subtotal

        TAMBAHKAN ke orderItems: {
            menu_id: item.menu_id,
            quantity: item.quantity,
            price: menu.harga,
            subtotal: subtotal,
            note: item.note ATAU NULL
        }
    END UNTUK

    // Generate nomor pesanan
    orderNumber ← GenerateOrderNumber()

    // Simpan pesanan
    order ← BUAT Order {
        order_number: orderNumber,
        table_id: table_id,
        customer_name: customer_name ATAU NULL,
        total_amount: totalAmount,
        note: note ATAU NULL,
        status: "pending_payment"
    }

    // Simpan item pesanan
    UNTUK SETIAP item DALAM orderItems:
        BUAT OrderItem { ...item, order_id: order.id }
    END UNTUK

    // Ambil pesanan lengkap dengan relasi
    completeOrder ← AMBIL Order BERDASARKAN order.id
                        SERTAKAN Table, OrderItems → Menu → Category

    // Kirim notifikasi real-time
    SOCKET_EMIT("new_order", completeOrder)

    RETURN { message: "Pesanan berhasil dibuat", order: completeOrder }
END
```

### 4.3 Ambil Semua Pesanan

```
ALGORITMA GetAllOrders

INPUT: query parameters (status, date)
OUTPUT: Daftar pesanan

BEGIN
    filter ← {}

    IF parameter.status ADA THEN
        filter.status ← parameter.status
    END IF

    IF parameter.date ADA THEN
        startDate ← parameter.date + " 00:00:00"
        endDate ← parameter.date + " 23:59:59"
        filter.created_at ← ANTARA(startDate, endDate)
    END IF

    orders ← AMBIL SEMUA Order
                DIMANA filter
                SERTAKAN Table, OrderItems → Menu (id, nama, gambar)
                URUTKAN BERDASARKAN created_at DESC

    RETURN orders
END
```

### 4.4 Update Status Pesanan

```
ALGORITMA UpdateOrderStatus

INPUT: order_id, status
OUTPUT: Pesanan yang diperbarui

BEGIN
    validStatuses ← ["pending_payment", "paid", "processing", "completed", "cancelled"]

    IF status TIDAK TERMASUK validStatuses THEN
        RETURN Error("Status tidak valid")
    END IF

    order ← CARI Order BERDASARKAN id = order_id

    IF order TIDAK DITEMUKAN THEN
        RETURN Error("Pesanan tidak ditemukan")
    END IF

    order.status ← status
    SIMPAN order

    updatedOrder ← AMBIL Order BERDASARKAN order_id
                    SERTAKAN Table, OrderItems → Menu

    // Kirim notifikasi real-time
    SOCKET_EMIT("order_updated", updatedOrder)

    RETURN { message: "Status pesanan berhasil diperbarui", order: updatedOrder }
END
```

---

## 5. Algoritma Pembayaran (Payment - Midtrans)

### 5.1 Buat Pembayaran

```
ALGORITMA CreatePayment

INPUT: order_id
OUTPUT: Snap token dan redirect URL Midtrans

BEGIN
    order ← CARI Order BERDASARKAN id = order_id
                SERTAKAN Table, OrderItems → Menu

    IF order TIDAK DITEMUKAN THEN
        RETURN Error("Pesanan tidak ditemukan")
    END IF

    IF order.status ≠ "pending_payment" THEN
        RETURN Error("Pesanan sudah dibayar atau dibatalkan")
    END IF

    // Bangun parameter transaksi Midtrans
    parameter ← {
        transaction_details: {
            order_id: order.order_number + "-" + TIMESTAMP_SEKARANG,
            gross_amount: INTEGER(order.total_amount)
        },
        item_details: [],
        customer_details: {
            first_name: order.customer_name ATAU "Meja " + order.table.nomor_meja
        },
        callbacks: {
            finish: CLIENT_URL + "/order/" + order.order_number
        }
    }

    // Isi detail item
    UNTUK SETIAP item DALAM order.items:
        TAMBAHKAN ke parameter.item_details: {
            id: "MENU-" + item.menu_id,
            price: INTEGER(item.price),
            quantity: item.quantity,
            name: POTONG(item.menu.nama, 50 karakter)
        }
    END UNTUK

    // Buat transaksi di Midtrans
    transaction ← MIDTRANS_SNAP.createTransaction(parameter)

    // Simpan snap token ke order
    order.payment_id ← transaction.token
    order.payment_method ← "midtrans"
    SIMPAN order

    RETURN {
        snap_token: transaction.token,
        redirect_url: transaction.redirect_url,
        order_number: order.order_number
    }
END
```

### 5.2 Handle Notifikasi Webhook Midtrans

```
ALGORITMA HandleNotification

INPUT: notification body dari Midtrans
OUTPUT: Status OK

BEGIN
    notification ← request.body

    // Verifikasi notifikasi dengan Midtrans Core API
    statusResponse ← MIDTRANS_CORE.transaction.notification(notification)

    orderId ← statusResponse.order_id
    transactionStatus ← statusResponse.transaction_status
    fraudStatus ← statusResponse.fraud_status

    // Ekstrak nomor pesanan asli (hapus suffix timestamp)
    orderNumber ← HAPUS_SUFFIX_ANGKA(orderId)

    order ← CARI Order DIMANA order_number = orderNumber
                SERTAKAN Table, OrderItems → Menu

    IF order TIDAK DITEMUKAN THEN
        LOG("Order " + orderNumber + " not found")
        RETURN { message: "OK" }
    END IF

    newStatus ← order.status

    // Tentukan status baru berdasarkan response Midtrans
    IF transactionStatus = "capture" OR transactionStatus = "settlement" THEN
        IF fraudStatus = "accept" OR fraudStatus KOSONG THEN
            newStatus ← "paid"
        END IF
    ELSE IF transactionStatus = "deny" OR "cancel" OR "expire" THEN
        newStatus ← "cancelled"
    ELSE IF transactionStatus = "pending" THEN
        newStatus ← "pending_payment"
    END IF

    // Update jika status berubah
    IF order.status ≠ newStatus THEN
        order.status ← newStatus
        order.payment_method ← statusResponse.payment_type ATAU "midtrans"
        SIMPAN order

        updatedOrder ← AMBIL Order DENGAN relasi lengkap

        // Kirim notifikasi real-time
        SOCKET_EMIT("order_updated", updatedOrder)
    END IF

    RETURN { message: "OK" }
END
```

### 5.3 Cek Status Pembayaran

```
ALGORITMA CheckPaymentStatus

INPUT: orderId (order_number)
OUTPUT: Status pembayaran

BEGIN
    order ← CARI Order DIMANA order_number = orderId

    IF order TIDAK DITEMUKAN THEN
        RETURN Error("Pesanan tidak ditemukan")
    END IF

    RETURN {
        order_number: order.order_number,
        status: order.status,
        payment_method: order.payment_method,
        total_amount: order.total_amount
    }
END
```

---

## 6. Algoritma Manajemen Meja & QR Code

### 6.1 Generate QR Code untuk Meja

```
ALGORITMA GenerateQRForTable

INPUT: table (objek meja)
OUTPUT: QR Code file dan URL menu

BEGIN
    // Pastikan direktori QR ada
    IF DIREKTORI_QR TIDAK ADA THEN
        BUAT_DIREKTORI(DIREKTORI_QR)
    END IF

    clientUrl ← ENV.CLIENT_URL ATAU "http://localhost:5173"
    menuUrl ← clientUrl + "/menu/" + table.id
    qrFilename ← "qr-meja-" + table.nomor_meja + ".png"
    qrPath ← GABUNG(DIREKTORI_QR, qrFilename)

    // Generate file QR Code PNG
    QR_CODE.toFile(qrPath, menuUrl, {
        width: 600,
        margin: 2,
        errorCorrectionLevel: "H",
        color: { dark: "#1E293B", light: "#FFFFFF" }
    })

    table.qr_code ← "qrcodes/" + qrFilename
    SIMPAN table

    RETURN { qrFilename, menuUrl }
END
```

### 6.2 Tambah Meja Baru

```
ALGORITMA CreateTable

INPUT: nomor_meja
OUTPUT: Data meja baru dengan QR Code

BEGIN
    IF nomor_meja KOSONG THEN
        RETURN Error("Nomor meja harus diisi")
    END IF

    existing ← CARI Table DIMANA nomor_meja = input.nomor_meja

    IF existing DITEMUKAN THEN
        RETURN Error("Nomor meja sudah ada")
    END IF

    table ← BUAT Table { nomor_meja: nomor_meja }

    // Auto-generate QR Code
    { menuUrl } ← GenerateQRForTable(table)

    RETURN {
        message: "Meja berhasil ditambahkan",
        table: table,
        menu_url: menuUrl
    }
END
```

### 6.3 Hapus Meja

```
ALGORITMA DeleteTable

INPUT: table_id
OUTPUT: Konfirmasi penghapusan

BEGIN
    table ← CARI Table BERDASARKAN id = table_id

    IF table TIDAK DITEMUKAN THEN
        RETURN Error("Meja tidak ditemukan")
    END IF

    // Hapus file QR Code
    IF table.qr_code ADA THEN
        qrPath ← GABUNG(upload_dir, table.qr_code)
        IF FILE_EXISTS(qrPath) THEN
            HAPUS_FILE(qrPath)
        END IF
    END IF

    HAPUS table

    RETURN { message: "Meja berhasil dihapus" }
END
```

### 6.4 Regenerate Semua QR Code

```
ALGORITMA RegenerateAllQR

INPUT: -
OUTPUT: Konfirmasi regenerasi

BEGIN
    tables ← AMBIL SEMUA Table URUTKAN nomor_meja ASC

    UNTUK SETIAP table DALAM tables:
        // Hapus QR lama
        IF table.qr_code ADA THEN
            oldPath ← GABUNG(upload_dir, table.qr_code)
            IF FILE_EXISTS(oldPath) THEN
                HAPUS_FILE(oldPath)
            END IF
        END IF

        // Generate QR baru
        GenerateQRForTable(table)
    END UNTUK

    RETURN {
        message: "QR Code berhasil di-generate untuk " + tables.length + " meja",
        count: tables.length
    }
END
```

---

## 7. Algoritma Laporan Penjualan

### 7.1 Generate Laporan

```
ALGORITMA GetReport

INPUT: start_date, end_date, period
OUTPUT: Data laporan penjualan

BEGIN
    filter ← { status: DALAM ["paid", "processing", "completed"] }

    IF start_date DAN end_date ADA THEN
        filter.created_at ← ANTARA(
            start_date + " 00:00:00",
            end_date + " 23:59:59"
        )
    END IF

    orders ← AMBIL SEMUA Order
                DIMANA filter
                SERTAKAN Table, OrderItems → Menu (id, nama)
                URUTKAN created_at DESC

    // Hitung total pendapatan
    totalRevenue ← 0
    UNTUK SETIAP order DALAM orders:
        totalRevenue ← totalRevenue + order.total_amount
    END UNTUK

    totalOrders ← JUMLAH(orders)

    // Hitung rata-rata per pesanan
    IF totalOrders > 0 THEN
        avgOrderValue ← totalRevenue / totalOrders
    ELSE
        avgOrderValue ← 0
    END IF

    // Hitung menu terlaris
    itemMap ← {}
    UNTUK SETIAP order DALAM orders:
        UNTUK SETIAP item DALAM order.items:
            nama ← item.menu.nama ATAU "Unknown"
            IF nama TIDAK ADA DI itemMap THEN
                itemMap[nama] ← { nama: nama, qty: 0, revenue: 0 }
            END IF
            itemMap[nama].qty ← itemMap[nama].qty + item.quantity
            itemMap[nama].revenue ← itemMap[nama].revenue + item.subtotal
        END UNTUK
    END UNTUK

    bestSellers ← URUTKAN itemMap BERDASARKAN qty DESC
    bestSellers ← AMBIL 10 TERATAS dari bestSellers

    RETURN {
        totalRevenue: totalRevenue,
        totalOrders: totalOrders,
        avgOrderValue: avgOrderValue,
        bestSellers: bestSellers,
        orders: orders
    }
END
```

---

## 8. Algoritma Keranjang Belanja (Client-Side)

### 8.1 Tambah Item ke Keranjang

```
ALGORITMA AddItemToCart

INPUT: menu (objek menu yang dipilih)
OUTPUT: Keranjang yang diperbarui

BEGIN
    existing ← CARI item DI keranjang DIMANA menu_id = menu.id

    IF existing DITEMUKAN THEN
        // Tambah quantity
        existing.quantity ← existing.quantity + 1
    ELSE
        // Tambah item baru
        TAMBAHKAN ke keranjang: {
            menu_id: menu.id,
            nama: menu.nama,
            harga: FLOAT(menu.harga),
            gambar: menu.gambar,
            quantity: 1,
            note: ""
        }
    END IF

    UPDATE state keranjang
END
```

### 8.2 Update Quantity Item

```
ALGORITMA UpdateQuantity

INPUT: menuId, quantity
OUTPUT: Keranjang yang diperbarui

BEGIN
    IF quantity ≤ 0 THEN
        // Hapus item dari keranjang
        HAPUS item DARI keranjang DIMANA menu_id = menuId
    ELSE
        // Update quantity
        CARI item DI keranjang DIMANA menu_id = menuId
        item.quantity ← quantity
    END IF

    UPDATE state keranjang
END
```

### 8.3 Hitung Total

```
ALGORITMA HitungTotal

INPUT: items[] (daftar item di keranjang)
OUTPUT: totalItems, totalPrice

BEGIN
    totalItems ← 0
    totalPrice ← 0

    UNTUK SETIAP item DALAM items:
        totalItems ← totalItems + item.quantity
        totalPrice ← totalPrice + (item.harga × item.quantity)
    END UNTUK

    RETURN { totalItems, totalPrice }
END
```

---

## 9. Algoritma Upload File (Middleware)

### 9.1 Filter dan Simpan File Gambar

```
ALGORITMA FileUploadMiddleware

INPUT: file dari HTTP request (multipart/form-data)
OUTPUT: File tersimpan atau error

BEGIN
    // Pastikan folder uploads ada
    IF DIREKTORI_UPLOAD TIDAK ADA THEN
        BUAT_DIREKTORI(DIREKTORI_UPLOAD)
    END IF

    // Validasi tipe file
    allowedTypes ← ["image/jpeg", "image/jpg", "image/png", "image/webp"]

    IF file.mimetype TIDAK TERMASUK allowedTypes THEN
        RETURN Error("Format file tidak didukung. Gunakan JPG, PNG, atau WebP.")
    END IF

    // Validasi ukuran file
    IF file.size > 5MB THEN
        RETURN Error("Ukuran file melebihi batas maksimum 5MB.")
    END IF

    // Generate nama file unik
    uniqueSuffix ← TIMESTAMP_SEKARANG + "-" + RANDOM_NUMBER
    filename ← uniqueSuffix + EKSTENSI_FILE(file.originalname)

    // Simpan file
    SIMPAN file KE GABUNG(DIREKTORI_UPLOAD, filename)

    request.file.filename ← filename
    LANJUTKAN ke handler berikutnya
END
```

---

## 10. Algoritma Inisialisasi Server

### 10.1 Start Server

```
ALGORITMA StartServer

INPUT: Konfigurasi environment
OUTPUT: Server berjalan

BEGIN
    // Inisialisasi Express app
    app ← EXPRESS()
    server ← HTTP_CREATE_SERVER(app)

    // Setup Socket.io
    io ← SOCKET_IO(server, {
        cors: { origin: allowedOrigins }
    })

    // Simpan io ke app untuk diakses controller
    app.SET("io", io)

    // Handle koneksi socket
    io.ON("connection", (socket) =>
        LOG("Client connected: " + socket.id)
        socket.ON("disconnect", () =>
            LOG("Client disconnected: " + socket.id)
        )
    )

    // Setup middleware
    app.USE(CORS({ origin: allowedOrigins, credentials: TRUE }))
    app.USE(EXPRESS.JSON())
    app.USE(EXPRESS.URLENCODED({ extended: TRUE }))
    app.USE("/uploads", EXPRESS.STATIC(uploads_dir))

    // Register routes
    app.USE("/api/auth", authRoutes)
    app.USE("/api/menus", menuRoutes)
    app.USE("/api/orders", orderRoutes)
    app.USE("/api/tables", tableRoutes)
    app.USE("/api/reports", reportRoutes)
    app.USE("/api/payment", paymentRoutes)

    // Koneksi database
    TRY
        SEQUELIZE.authenticate()
        LOG("Koneksi MySQL berhasil!")

        SEQUELIZE.sync()
        LOG("Sinkronisasi model selesai.")

        server.LISTEN(PORT)
        LOG("Server berjalan di http://localhost:" + PORT)
    CATCH error
        LOG("Gagal koneksi ke database: " + error.message)
        PROCESS.EXIT(1)
    END TRY
END
```
