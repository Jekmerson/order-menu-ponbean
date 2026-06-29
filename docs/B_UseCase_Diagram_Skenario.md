# B. Use Case Diagram & Deskripsi Use Case

## Sistem Pemesanan Menu Kafe Ponbean Coffee

---

## Use Case Diagram

![Use Case Diagram - Ponbean Coffee Order System](./images/B_UseCase_Diagram_Skenario_01.png)

---

## Deskripsi Use Case

---

### UC-01: Scan QR Code

| Komponen | Deskripsi |
|----------|-----------|
| **Use Case Name** | Scan QR Code |
| **Requirement** | Pelanggan dapat memindai QR Code di meja untuk mengakses menu digital secara langsung |
| **Goal** | Memberikan akses cepat ke halaman menu digital melalui QR Code tanpa perlu mengetik URL secara manual |
| **Pre-Conditions** | 1. QR Code tersedia di meja dan dalam kondisi terbaca<br>2. Smartphone pelanggan memiliki kamera atau aplikasi QR scanner<br>3. Smartphone terhubung ke jaringan internet |
| **Post-Conditions** | Halaman menu digital terbuka di browser pelanggan dengan informasi nomor meja (`table_id`) terisi secara otomatis |
| **Failed End Conditions** | 1. QR Code tidak dapat terbaca karena rusak atau terhalang<br>2. Meja tidak aktif (`is_active = false`) sehingga sistem menampilkan pesan error<br>3. URL tidak valid sehingga sistem menampilkan halaman 404 |
| **Primary Actor** | Pelanggan |
| **Main Flow** | 1. Pelanggan membuka kamera atau aplikasi QR scanner di smartphone<br>2. Pelanggan mengarahkan kamera ke QR Code yang tersedia di meja<br>3. Sistem mendeteksi QR Code dan menerjemahkan URL yang terkandung di dalamnya<br>4. Browser terbuka secara otomatis dan menampilkan halaman menu dengan `table_id` dari parameter URL<br>5. Sistem memuat daftar menu yang tersedia untuk pelanggan |
| **Alternatif Flow** | 3a. QR Code rusak atau tidak terbaca → Pelanggan meminta bantuan ke kasir untuk mendapatkan akses manual<br>4a. Meja tidak aktif (`is_active = false`) → Sistem menampilkan pesan error bahwa meja tidak tersedia<br>4b. URL tidak valid → Sistem menampilkan halaman 404 Not Found |

---

### UC-02: Tambah ke Keranjang

| Komponen | Deskripsi |
|----------|-----------|
| **Use Case Name** | Tambah ke Keranjang |
| **Requirement** | Pelanggan dapat menambahkan item menu yang diinginkan ke dalam keranjang belanja |
| **Goal** | Memungkinkan pelanggan mengumpulkan item-item pesanan sebelum melakukan pemesanan secara sekaligus |
| **Pre-Conditions** | 1. Pelanggan sedang berada di halaman menu<br>2. Menu yang ingin ditambahkan berstatus tersedia (`is_available = true`) |
| **Post-Conditions** | Item menu berhasil ditambahkan ke keranjang dan badge jumlah item pada ikon keranjang diperbarui |
| **Failed End Conditions** | 1. Item menu tidak tersedia saat ditambahkan karena perubahan status ketersediaan secara real-time |
| **Primary Actor** | Pelanggan |
| **Main Flow** | 1. Pelanggan menekan tombol "Tambah" pada item menu yang diinginkan<br>2. Sistem memeriksa apakah item tersebut sudah ada di keranjang<br>3. Jika item belum ada di keranjang, sistem menambahkan item baru dengan quantity = 1<br>4. Sistem menampilkan notifikasi "Item ditambahkan ke keranjang"<br>5. Badge jumlah item di ikon keranjang diperbarui sesuai total item |
| **Alternatif Flow** | 3a. Item sudah ada di keranjang → Sistem menambah quantity item tersebut sebanyak +1 tanpa membuat entry baru |

---

### UC-03: Kelola Keranjang

| Komponen | Deskripsi |
|----------|-----------|
| **Use Case Name** | Kelola Keranjang |
| **Requirement** | Pelanggan dapat mengatur isi keranjang belanja termasuk mengubah quantity, menambahkan catatan khusus, atau menghapus item |
| **Goal** | Memberikan kontrol penuh kepada pelanggan untuk menyesuaikan pesanan sebelum dikirim ke sistem |
| **Pre-Conditions** | 1. Keranjang belanja memiliki minimal 1 item |
| **Post-Conditions** | Isi keranjang diperbarui sesuai dengan perubahan yang dilakukan pelanggan, termasuk perhitungan ulang subtotal dan total harga |
| **Failed End Conditions** | 1. Terjadi error saat menyimpan perubahan keranjang ke state lokal |
| **Primary Actor** | Pelanggan |
| **Main Flow** | 1. Pelanggan membuka panel keranjang (cart drawer)<br>2. Sistem menampilkan daftar item di keranjang beserta subtotal masing-masing item<br>3. Pelanggan mengubah quantity item menggunakan tombol (+/-)<br>4. Sistem menghitung ulang subtotal per item dan total keseluruhan harga<br>5. Pelanggan menambahkan catatan khusus untuk item tertentu (misalnya: "tanpa gula")<br>6. Sistem menyimpan catatan pada item yang bersangkutan |
| **Alternatif Flow** | 3a. Quantity dikurangi hingga menjadi 0 → Sistem secara otomatis menghapus item dari keranjang<br>3b. Pelanggan menekan tombol hapus pada item → Sistem menghapus item dari keranjang<br>6a. Semua item telah dihapus sehingga keranjang kosong → Sistem menampilkan pesan "Keranjang kosong" dan menutup panel |

---

### UC-04: Buat Pesanan

| Komponen | Deskripsi |
|----------|-----------|
| **Use Case Name** | Buat Pesanan |
| **Requirement** | Pelanggan dapat mengirimkan pesanan dari keranjang belanja ke sistem untuk diproses |
| **Goal** | Mengkonversi item-item di keranjang menjadi pesanan resmi yang tersimpan di database dan diterima oleh kasir secara real-time |
| **Pre-Conditions** | 1. Keranjang memiliki minimal 1 item<br>2. Meja yang digunakan berstatus aktif dan valid<br>3. Semua item di keranjang masih berstatus tersedia |
| **Post-Conditions** | 1. Pesanan tersimpan di database dengan status "pending_payment"<br>2. Kasir menerima notifikasi pesanan baru via Socket.io<br>3. Keranjang belanja dikosongkan<br>4. Pelanggan diarahkan ke halaman pembayaran |
| **Failed End Conditions** | 1. Meja tidak aktif (`is_active = false`) sehingga pesanan ditolak<br>2. Salah satu item menu sudah tidak tersedia sehingga pesanan gagal dibuat<br>3. Meja tidak ditemukan di database |
| **Primary Actor** | Pelanggan |
| **Main Flow** | 1. Pelanggan mengisi nama pemesan (opsional)<br>2. Pelanggan menekan tombol "Buat Pesanan"<br>3. Sistem memvalidasi bahwa meja aktif dan semua item di keranjang masih tersedia<br>4. Sistem menghitung total harga pesanan berdasarkan quantity dan harga setiap item<br>5. Sistem men-generate nomor pesanan unik dengan format: ORD-YYYYMMDD-XXX<br>6. Sistem menyimpan data Order dan OrderItem ke database<br>7. Sistem mengirimkan event "new_order" melalui Socket.io ke dashboard kasir<br>8. Sistem menampilkan halaman pembayaran kepada pelanggan<br>9. Keranjang belanja dikosongkan |
| **Alternatif Flow** | 3a. Meja tidak aktif → Sistem menampilkan pesan error "Meja tidak valid atau tidak aktif"<br>3b. Salah satu menu tidak tersedia → Sistem menampilkan pesan error disertai nama menu yang tidak tersedia<br>3c. Meja tidak ditemukan di database → Sistem menampilkan pesan error "Meja tidak ditemukan" |

---

### UC-05: Bayar Pesanan

| Komponen | Deskripsi |
|----------|-----------|
| **Use Case Name** | Bayar Pesanan |
| **Requirement** | Pelanggan dapat melakukan pembayaran pesanan melalui payment gateway Midtrans dengan berbagai metode pembayaran |
| **Goal** | Memfasilitasi proses pembayaran digital yang aman dan terintegrasi sehingga pelanggan dapat membayar tanpa perlu ke kasir |
| **Pre-Conditions** | 1. Pesanan sudah dibuat dan berstatus "pending_payment"<br>2. Konfigurasi Midtrans (Server Key, Client Key) sudah tersedia di server |
| **Post-Conditions** | 1. Pembayaran berhasil diproses<br>2. Status pesanan berubah menjadi "paid"<br>3. Pelanggan diarahkan ke halaman tracking pesanan |
| **Failed End Conditions** | 1. Pelanggan membatalkan pembayaran sehingga status tetap "pending_payment"<br>2. Pembayaran ditolak oleh bank/provider sehingga status menjadi "cancelled"<br>3. Pembayaran melewati batas waktu (expired) sehingga status menjadi "cancelled"<br>4. Webhook dari Midtrans gagal diterima server |
| **Primary Actor** | Pelanggan, Midtrans (Payment Gateway) |
| **Main Flow** | 1. Sistem mengirimkan parameter transaksi ke Midtrans Snap API<br>2. Midtrans mengembalikan `snap_token` dan `redirect_url`<br>3. Sistem menampilkan popup pembayaran Midtrans (Snap)<br>4. Pelanggan memilih metode pembayaran yang diinginkan (QRIS, Virtual Account, e-Wallet, Kartu Kredit)<br>5. Pelanggan menyelesaikan proses pembayaran sesuai metode yang dipilih<br>6. Midtrans mengirimkan notifikasi webhook ke server<br>7. Server memverifikasi notifikasi dan mengubah status pesanan menjadi "paid"<br>8. Server mengirimkan event "order_updated" via Socket.io ke semua client terkait<br>9. Pelanggan diarahkan ke halaman tracking pesanan |
| **Alternatif Flow** | 4a. Pelanggan membatalkan pembayaran → Status pesanan tetap "pending_payment", pelanggan dapat mencoba kembali<br>5a. Pembayaran gagal/ditolak → Midtrans mengirim status "deny" → Status pesanan menjadi "cancelled"<br>5b. Pembayaran melewati batas waktu → Midtrans mengirim status "expire" → Status pesanan menjadi "cancelled"<br>6a. Webhook gagal diterima → Sistem dapat melakukan pengecekan manual melalui API status Midtrans |

---

### UC-06: Tracking Pesanan

| Komponen | Deskripsi |
|----------|-----------|
| **Use Case Name** | Tracking Pesanan |
| **Requirement** | Pelanggan dapat memantau status pesanan secara real-time setelah melakukan pemesanan |
| **Goal** | Memberikan transparansi kepada pelanggan mengenai progres pesanan mereka dari awal hingga selesai melalui pembaruan status secara real-time |
| **Pre-Conditions** | 1. Pesanan sudah dibuat dan pelanggan memiliki nomor pesanan (order_number)<br>2. Koneksi Socket.io aktif untuk menerima pembaruan real-time |
| **Post-Conditions** | Pelanggan mengetahui status terbaru pesanan dan mendapatkan pembaruan secara otomatis ketika status berubah |
| **Failed End Conditions** | 1. Nomor pesanan tidak valid atau tidak ditemukan di database<br>2. Koneksi Socket.io terputus sehingga pembaruan real-time tidak berfungsi |
| **Primary Actor** | Pelanggan |
| **Main Flow** | 1. Pelanggan mengakses halaman tracking pesanan (melalui redirect otomatis setelah pembayaran atau memasukkan URL langsung)<br>2. Sistem mengambil data pesanan berdasarkan `order_number` dari database<br>3. Sistem menampilkan detail pesanan beserta status saat ini<br>4. Sistem mendengarkan event "order_updated" melalui Socket.io<br>5. Ketika kasir mengubah status pesanan, tampilan halaman tracking diperbarui secara otomatis tanpa perlu refresh |
| **Alternatif Flow** | 2a. Nomor pesanan tidak valid → Sistem menampilkan pesan "Pesanan tidak ditemukan" |

---

### UC-07: Login

| Komponen | Deskripsi |
|----------|-----------|
| **Use Case Name** | Login |
| **Requirement** | Admin atau Kasir dapat melakukan autentikasi untuk mengakses dashboard sistem |
| **Goal** | Memastikan hanya pengguna yang memiliki akun valid yang dapat mengakses fitur-fitur dashboard sesuai dengan role masing-masing |
| **Pre-Conditions** | 1. Pengguna memiliki akun yang terdaftar di database dengan role admin atau kasir<br>2. Halaman login dapat diakses |
| **Post-Conditions** | 1. Pengguna berhasil terotentikasi<br>2. Token JWT dan data pengguna tersimpan di localStorage<br>3. Pengguna diarahkan ke dashboard sesuai role (admin → /admin, kasir → /kasir) |
| **Failed End Conditions** | 1. Username atau password yang dimasukkan kosong sehingga gagal validasi<br>2. Username tidak ditemukan di database<br>3. Password yang dimasukkan tidak cocok dengan hash password di database |
| **Primary Actor** | Admin, Kasir |
| **Main Flow** | 1. Pengguna mengakses halaman login<br>2. Pengguna memasukkan username dan password<br>3. Sistem memvalidasi kredensial yang dimasukkan<br>4. Sistem men-generate token JWT setelah validasi berhasil<br>5. Token JWT dan data pengguna disimpan di localStorage browser<br>6. Jika role = "admin" → Pengguna diarahkan ke halaman /admin<br>7. Jika role = "kasir" → Pengguna diarahkan ke halaman /kasir |
| **Alternatif Flow** | 2a. Username atau password kosong → Sistem menampilkan pesan error validasi "Field tidak boleh kosong"<br>3a. Username tidak ditemukan di database → Sistem menampilkan pesan "Username atau password salah"<br>3b. Password tidak cocok → Sistem menampilkan pesan "Username atau password salah" |

---

### UC-08: Kelola Menu (CRUD)

| Komponen | Deskripsi |
|----------|-----------|
| **Use Case Name** | Kelola Menu (CRUD) |
| **Requirement** | Admin dapat melakukan pengelolaan data menu secara lengkap meliputi tambah, lihat, ubah, hapus, dan toggle ketersediaan menu |
| **Goal** | Menyediakan fitur manajemen menu yang komprehensif agar admin dapat menjaga katalog menu tetap akurat dan up-to-date |
| **Pre-Conditions** | 1. Admin sudah login dan memiliki token JWT yang valid<br>2. Admin berada di halaman Menu Management |
| **Post-Conditions** | Data menu di database diperbarui sesuai operasi yang dilakukan (tambah/ubah/hapus/toggle ketersediaan) |
| **Failed End Conditions** | 1. Validasi input gagal karena field wajib (nama, kategori, harga) tidak diisi<br>2. Upload gambar gagal karena format file tidak didukung atau ukuran terlalu besar<br>3. Koneksi ke server gagal saat menyimpan data |
| **Primary Actor** | Admin |
| **Main Flow** | **Tambah Menu:**<br>1. Admin menekan tombol "Tambah Menu"<br>2. Sistem menampilkan form input (nama, kategori, harga, deskripsi, gambar)<br>3. Admin mengisi seluruh form dan mengupload gambar menu<br>4. Sistem memvalidasi input (nama, kategori, harga wajib diisi)<br>5. Sistem menyimpan data menu ke database<br>6. Sistem menyimpan file gambar ke folder uploads di server<br>7. Sistem menampilkan notifikasi "Menu berhasil ditambahkan" |
| **Alternatif Flow** | **Edit Menu:**<br>1. Admin menekan tombol "Edit" pada item menu<br>2. Sistem menampilkan form yang terisi data menu saat ini<br>3. Admin mengubah data yang diinginkan<br>4. Jika gambar diubah, sistem menghapus gambar lama dan menyimpan gambar baru<br>5. Sistem menyimpan perubahan dan menampilkan notifikasi sukses<br><br>**Hapus Menu:**<br>1. Admin menekan tombol "Hapus" pada item menu<br>2. Sistem menampilkan dialog konfirmasi penghapusan<br>3. Admin mengkonfirmasi → Sistem menghapus data menu dan file gambar terkait dari server<br><br>**Toggle Ketersediaan:**<br>1. Admin menekan toggle ketersediaan pada item menu<br>2. Sistem mengubah status `is_available` (true ↔ false)<br>3. Menu yang berstatus tidak tersedia tidak akan ditampilkan di halaman pelanggan |

---

### UC-09: Kelola Kategori

| Komponen | Deskripsi |
|----------|-----------|
| **Use Case Name** | Kelola Kategori |
| **Requirement** | Admin dapat menambah, mengubah, dan menghapus kategori menu untuk mengelompokkan item-item menu |
| **Goal** | Menyediakan sistem kategorisasi menu yang fleksibel agar daftar menu terorganisir dengan baik dan memudahkan pelanggan dalam memilih |
| **Pre-Conditions** | 1. Admin sudah login dan memiliki token JWT yang valid |
| **Post-Conditions** | Data kategori di database diperbarui sesuai operasi yang dilakukan |
| **Failed End Conditions** | 1. Nama kategori kosong saat menambah atau mengubah kategori<br>2. Kategori yang akan dihapus masih memiliki menu yang terkait sehingga penghapusan ditolak |
| **Primary Actor** | Admin |
| **Main Flow** | 1. Admin mengakses halaman kelola kategori<br>2. Sistem menampilkan daftar kategori yang sudah ada beserta jumlah menu per kategori<br>3. Admin menambahkan kategori baru dengan mengisi nama dan icon<br>4. Sistem menyimpan data kategori baru ke database<br>5. Sistem menampilkan notifikasi sukses |
| **Alternatif Flow** | 3a. Admin menghapus kategori yang masih memiliki menu → Sistem menampilkan pesan error "Kategori tidak bisa dihapus karena masih memiliki menu terkait"<br>3b. Admin menghapus kategori yang tidak memiliki menu → Sistem menghapus kategori dan menampilkan notifikasi sukses<br>3c. Admin mengubah nama atau icon kategori → Sistem memperbarui data kategori di database |

---

### UC-10: Kelola Meja

| Komponen | Deskripsi |
|----------|-----------|
| **Use Case Name** | Kelola Meja |
| **Requirement** | Admin dapat menambah, menghapus, dan mengatur status meja serta mengelola QR Code untuk setiap meja |
| **Goal** | Menyediakan manajemen meja yang terintegrasi dengan sistem QR Code agar setiap meja memiliki akses unik ke halaman menu digital |
| **Pre-Conditions** | 1. Admin sudah login dan memiliki token JWT yang valid<br>2. Admin berada di halaman Table Management |
| **Post-Conditions** | Data meja dan file QR Code diperbarui sesuai operasi yang dilakukan |
| **Failed End Conditions** | 1. Nomor meja yang dimasukkan sudah ada (duplikat) sehingga penambahan ditolak<br>2. Gagal men-generate file QR Code karena error sistem |
| **Primary Actor** | Admin |
| **Main Flow** | 1. Admin memasukkan nomor meja yang ingin ditambahkan<br>2. Sistem memvalidasi bahwa nomor meja belum digunakan (tidak duplikat)<br>3. Sistem menyimpan data meja baru ke database<br>4. Sistem secara otomatis men-generate QR Code (file PNG) yang mengarah ke URL menu dengan `table_id` terkait<br>5. Sistem menampilkan meja baru beserta QR Code yang sudah di-generate |
| **Alternatif Flow** | 2a. Nomor meja sudah ada di database → Sistem menampilkan pesan error "Nomor meja sudah ada"<br>Alt-1: Admin menghapus meja → Sistem menghapus data meja dari database beserta file QR Code terkait<br>Alt-2: Admin toggle status meja → Sistem mengubah status `is_active` (aktif ↔ nonaktif), meja nonaktif tidak dapat diakses pelanggan<br>Alt-3: Admin regenerate QR Code → Sistem menghapus file QR Code lama dan membuat QR Code baru untuk meja tersebut |

---

### UC-11: Kelola User

| Komponen | Deskripsi |
|----------|-----------|
| **Use Case Name** | Kelola User |
| **Requirement** | Admin dapat menambah dan menghapus akun pengguna dengan role admin atau kasir |
| **Goal** | Menyediakan manajemen akun pengguna untuk mengontrol siapa saja yang memiliki akses ke dashboard sistem |
| **Pre-Conditions** | 1. Admin sudah login dan memiliki token JWT yang valid |
| **Post-Conditions** | Data pengguna di database diperbarui sesuai operasi yang dilakukan |
| **Failed End Conditions** | 1. Username yang dimasukkan sudah digunakan oleh akun lain<br>2. Field wajib (nama, username, password) tidak diisi<br>3. Admin mencoba menghapus akun miliknya sendiri |
| **Primary Actor** | Admin |
| **Main Flow** | 1. Admin mengisi form penambahan user (nama, username, password, role)<br>2. Sistem memvalidasi input (nama, username, password wajib diisi)<br>3. Sistem memeriksa bahwa username belum terpakai oleh akun lain<br>4. Sistem meng-hash password menggunakan bcrypt<br>5. Sistem menyimpan data user baru ke database<br>6. Sistem menampilkan notifikasi sukses |
| **Alternatif Flow** | 3a. Username sudah digunakan → Sistem menampilkan pesan error "Username sudah terdaftar"<br>Alt-1: Admin menghapus user lain → Sistem menghapus data user dari database dan menampilkan notifikasi sukses<br>Alt-2: Admin mencoba menghapus akun sendiri → Sistem menolak dengan pesan "Tidak bisa menghapus akun sendiri" |

---

### UC-12: Lihat Dashboard

| Komponen | Deskripsi |
|----------|-----------|
| **Use Case Name** | Lihat Dashboard |
| **Requirement** | Admin dapat melihat ringkasan statistik penjualan dan informasi penting lainnya pada satu halaman utama |
| **Goal** | Menyajikan overview bisnis secara ringkas dan informatif agar admin dapat memantau performa kafe dengan cepat |
| **Pre-Conditions** | 1. Admin sudah login dan memiliki token JWT yang valid<br>2. Terdapat data pesanan di database |
| **Post-Conditions** | Dashboard menampilkan statistik terkini meliputi total pesanan, pendapatan, dan data lainnya |
| **Failed End Conditions** | 1. Gagal mengambil data statistik dari API karena koneksi error<br>2. Tidak ada data pesanan sama sekali sehingga statistik menampilkan nilai kosong/nol |
| **Primary Actor** | Admin |
| **Main Flow** | 1. Sistem mengambil data statistik dari API endpoint<br>2. Sistem menampilkan ringkasan berupa total pesanan, total pendapatan, dan rata-rata pendapatan per pesanan<br>3. Sistem menampilkan daftar menu terlaris berdasarkan jumlah pemesanan<br>4. Sistem menampilkan daftar pesanan terbaru |
| **Alternatif Flow** | 1a. Tidak ada data pesanan → Sistem menampilkan dashboard dengan nilai statistik = 0 dan daftar kosong |

---

### UC-13: Lihat Laporan Penjualan

| Komponen | Deskripsi |
|----------|-----------|
| **Use Case Name** | Lihat Laporan Penjualan |
| **Requirement** | Admin dapat melihat rekap penjualan berdasarkan rentang tanggal tertentu secara detail |
| **Goal** | Menyediakan laporan penjualan yang komprehensif untuk membantu admin dalam analisis bisnis dan pengambilan keputusan |
| **Pre-Conditions** | 1. Admin sudah login dan memiliki token JWT yang valid<br>2. Terdapat data pesanan di database |
| **Post-Conditions** | Laporan penjualan ditampilkan sesuai filter rentang tanggal yang dipilih, meliputi statistik dan detail pesanan |
| **Failed End Conditions** | 1. Tidak ada pesanan dalam rentang tanggal yang dipilih sehingga laporan menampilkan data kosong<br>2. Rentang tanggal tidak valid (tanggal akhir lebih awal dari tanggal awal) |
| **Primary Actor** | Admin |
| **Main Flow** | 1. Admin memilih rentang tanggal (tanggal awal dan tanggal akhir)<br>2. Sistem mengambil data pesanan yang berstatus paid/processing/completed dalam rentang tanggal tersebut<br>3. Sistem menghitung total pendapatan, jumlah pesanan, dan rata-rata pendapatan per pesanan<br>4. Sistem menampilkan 10 menu terlaris dalam periode tersebut<br>5. Sistem menampilkan daftar detail setiap pesanan |
| **Alternatif Flow** | 2a. Tidak ada pesanan dalam rentang tanggal yang dipilih → Sistem menampilkan laporan dengan data kosong (total = 0, daftar pesanan kosong) |

---

### UC-14: Terima Pesanan

| Komponen | Deskripsi |
|----------|-----------|
| **Use Case Name** | Terima Pesanan |
| **Requirement** | Kasir dapat menerima pesanan baru dari pelanggan secara real-time melalui dashboard |
| **Goal** | Memastikan kasir mendapat notifikasi instan setiap kali ada pesanan baru masuk sehingga pesanan dapat segera diproses |
| **Pre-Conditions** | 1. Kasir sudah login dan memiliki token JWT yang valid<br>2. Dashboard kasir terhubung ke server melalui Socket.io |
| **Post-Conditions** | Pesanan baru tampil di dashboard kasir dan kasir menerima notifikasi |
| **Failed End Conditions** | 1. Koneksi Socket.io terputus sehingga kasir tidak menerima notifikasi real-time<br>2. Data pesanan gagal dimuat dari server |
| **Primary Actor** | Kasir |
| **Main Flow** | 1. Pelanggan membuat pesanan baru dari halaman menu<br>2. Server mengirimkan event "new_order" melalui Socket.io<br>3. Dashboard kasir menerima event dan menampilkan notifikasi pesanan baru<br>4. Pesanan baru muncul di daftar pesanan masuk pada dashboard<br>5. Kasir melihat detail pesanan (nomor meja, daftar item, total harga) |
| **Alternatif Flow** | 2a. Koneksi Socket.io terputus → Kasir melakukan refresh halaman untuk mengambil data pesanan terbaru secara manual |

---

### UC-15: Update Status Pesanan

| Komponen | Deskripsi |
|----------|-----------|
| **Use Case Name** | Update Status Pesanan |
| **Requirement** | Kasir dapat mengubah status pesanan sesuai progres pengerjaan, dan Midtrans dapat mengupdate status pembayaran melalui webhook |
| **Goal** | Mengelola alur status pesanan dari awal hingga selesai agar pelanggan mendapat informasi progres secara real-time |
| **Pre-Conditions** | 1. Pesanan sudah ada di dalam sistem<br>2. Kasir sudah login (untuk update manual) atau webhook Midtrans terverifikasi (untuk update otomatis) |
| **Post-Conditions** | 1. Status pesanan diperbarui di database<br>2. Pelanggan mendapat pembaruan status secara real-time melalui Socket.io |
| **Failed End Conditions** | 1. Gagal menyimpan perubahan status ke database<br>2. Event Socket.io gagal dikirim sehingga pelanggan tidak mendapat pembaruan |
| **Primary Actor** | Kasir, Midtrans (Payment Gateway) |
| **Main Flow** | 1. Kasir memilih pesanan dari daftar pesanan di dashboard<br>2. Kasir memilih status baru yang sesuai dengan progres pesanan<br>3. Alur status: `pending_payment` → `paid` → `processing` → `completed`<br>4. Sistem menyimpan status baru ke database<br>5. Sistem mengirimkan event "order_updated" melalui Socket.io<br>6. Halaman tracking pesanan pelanggan diperbarui secara real-time |
| **Alternatif Flow** | 2a. Kasir mengubah status menjadi "cancelled" → Pesanan dibatalkan dan pelanggan menerima notifikasi pembatalan<br>Alt: Midtrans mengirimkan webhook → Server secara otomatis mengupdate status pesanan berdasarkan `transaction_status` dari Midtrans |

---

### UC-16: Lihat Riwayat Pesanan

| Komponen | Deskripsi |
|----------|-----------|
| **Use Case Name** | Lihat Riwayat Pesanan |
| **Requirement** | Kasir dapat melihat histori seluruh pesanan yang pernah masuk ke sistem |
| **Goal** | Menyediakan akses ke riwayat pesanan untuk keperluan pengecekan, verifikasi, dan referensi |
| **Pre-Conditions** | 1. Kasir sudah login dan memiliki token JWT yang valid |
| **Post-Conditions** | Daftar riwayat pesanan ditampilkan sesuai filter yang diterapkan |
| **Failed End Conditions** | 1. Gagal memuat data riwayat pesanan dari server<br>2. Tidak ada pesanan sama sekali di database |
| **Primary Actor** | Kasir |
| **Main Flow** | 1. Kasir membuka halaman riwayat pesanan di dashboard<br>2. Sistem mengambil semua data pesanan yang diurutkan dari yang terbaru<br>3. Kasir dapat memfilter pesanan berdasarkan status atau rentang tanggal<br>4. Kasir dapat memilih pesanan tertentu untuk melihat detail lengkapnya |
| **Alternatif Flow** | 3a. Tidak ada pesanan yang sesuai dengan filter → Sistem menampilkan pesan "Tidak ada pesanan ditemukan" |

---

### UC-17: Cetak Struk

| Komponen | Deskripsi |
|----------|-----------|
| **Use Case Name** | Cetak Struk |
| **Requirement** | Kasir dapat mencetak struk pesanan sebagai bukti transaksi bagi pelanggan |
| **Goal** | Menyediakan bukti fisik transaksi yang tercetak pada printer thermal untuk diberikan kepada pelanggan |
| **Pre-Conditions** | 1. Pesanan sudah dibayar (status minimal "paid")<br>2. Printer thermal 80mm tersedia dan terhubung ke sistem |
| **Post-Conditions** | Struk pesanan berhasil dicetak melalui printer thermal |
| **Failed End Conditions** | 1. Printer tidak terhubung atau tidak terdeteksi oleh sistem<br>2. Printer kehabisan kertas atau mengalami error hardware |
| **Primary Actor** | Kasir |
| **Main Flow** | 1. Kasir memilih pesanan dan menekan tombol "Cetak Struk"<br>2. Sistem men-generate format struk yang berisi nomor pesanan, nomor meja, daftar item pesanan, total harga, dan waktu transaksi<br>3. Sistem mengirimkan data struk ke printer thermal<br>4. Struk tercetak dan siap diberikan kepada pelanggan |
| **Alternatif Flow** | 3a. Printer tidak terhubung → Sistem menampilkan pesan error "Printer tidak ditemukan"<br>3b. Terjadi error saat mencetak → Sistem menampilkan pesan error dan kasir dapat mencoba mencetak ulang |

---

### UC-18: Logout

| Komponen | Deskripsi |
|----------|-----------|
| **Use Case Name** | Logout |
| **Requirement** | Admin atau Kasir dapat keluar dari sistem dengan aman |
| **Goal** | Mengakhiri sesi pengguna dan membersihkan data autentikasi dari browser untuk menjaga keamanan akses |
| **Pre-Conditions** | 1. Pengguna (Admin/Kasir) sudah login dan memiliki sesi aktif |
| **Post-Conditions** | 1. Token JWT dan data pengguna dihapus dari localStorage<br>2. Pengguna diarahkan kembali ke halaman login |
| **Failed End Conditions** | 1. Gagal menghapus data dari localStorage (kasus sangat jarang terjadi) |
| **Primary Actor** | Admin, Kasir |
| **Main Flow** | 1. Pengguna menekan tombol "Logout" pada dashboard<br>2. Sistem menghapus token JWT dan data pengguna dari localStorage browser<br>3. Sistem mengarahkan pengguna kembali ke halaman login |
| **Alternatif Flow** | — (Tidak ada alternatif flow, proses logout bersifat langsung) |

---

### UC-19: Generate QR Code

| Komponen | Deskripsi |
|----------|-----------|
| **Use Case Name** | Generate QR Code |
| **Requirement** | Sistem dapat men-generate QR Code unik untuk setiap meja yang mengarah langsung ke URL halaman menu |
| **Goal** | Menyediakan QR Code yang dapat dipindai oleh pelanggan untuk mengakses menu digital secara cepat tanpa perlu mengetik URL |
| **Pre-Conditions** | 1. Meja sudah dibuat dan tersimpan di database<br>2. Konfigurasi `CLIENT_URL` sudah tersedia di environment server |
| **Post-Conditions** | File QR Code dalam format PNG tersimpan di server pada folder `uploads/qrcodes/` dan kolom `qr_code` pada data meja diperbarui |
| **Failed End Conditions** | 1. Gagal men-generate file QR Code karena error pada library QR<br>2. Gagal menyimpan file ke folder `uploads/qrcodes/` karena permission error |
| **Primary Actor** | Admin |
| **Main Flow** | 1. Sistem membuat URL menu dengan format: `{CLIENT_URL}/menu/{table_id}`<br>2. Sistem men-generate file QR Code PNG dengan error correction level "H" (High)<br>3. Sistem menyimpan file QR Code ke folder `uploads/qrcodes/` di server<br>4. Sistem mengupdate kolom `qr_code` pada tabel meja di database |
| **Alternatif Flow** | Alt: Admin memilih "Regenerate All QR" → Sistem men-generate ulang QR Code untuk semua meja yang berstatus aktif |
