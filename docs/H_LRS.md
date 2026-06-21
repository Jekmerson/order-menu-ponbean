# H. Logical Record Structure (LRS)

## Penjelasan

Logical Record Structure (LRS) merupakan representasi dari struktur record-record pada tabel-tabel yang terbentuk dari hasil relasi antar himpunan entitas pada ERD. LRS menunjukkan tipe data, kunci, dan hubungan antar tabel secara lebih teknis.

Database yang digunakan adalah **ponbean_db** dengan software MySQL melalui Sequelize ORM.

## Diagram LRS

```mermaid
graph LR
    subgraph USERS ["USERS"]
        direction TB
        U1["*id (PK)"]
        U2["nama"]
        U3["username"]
        U4["password"]
        U5["role"]
        U6["created_at"]
        U7["updated_at"]
    end

    subgraph CATEGORIES ["CATEGORIES"]
        direction TB
        C1["*id (PK)"]
        C2["nama"]
        C3["icon"]
        C4["created_at"]
        C5["updated_at"]
    end

    subgraph MENUS ["MENUS"]
        direction TB
        M1["*id (PK)"]
        M2["**category_id (FK)"]
        M3["nama"]
        M4["deskripsi"]
        M5["harga"]
        M6["gambar"]
        M7["is_available"]
        M8["created_at"]
        M9["updated_at"]
    end

    subgraph TABLES ["TABLES"]
        direction TB
        T1["*id (PK)"]
        T2["nomor_meja"]
        T3["qr_code"]
        T4["is_active"]
        T5["created_at"]
        T6["updated_at"]
    end

    subgraph ORDERS ["ORDERS"]
        direction TB
        O1["*id (PK)"]
        O2["order_number"]
        O3["**table_id (FK)"]
        O4["customer_name"]
        O5["status"]
        O6["payment_method"]
        O7["payment_id"]
        O8["total_amount"]
        O9["note"]
        O10["created_at"]
        O11["updated_at"]
    end

    subgraph ORDER_ITEMS ["ORDER_ITEMS"]
        direction TB
        OI1["*id (PK)"]
        OI2["**order_id (FK)"]
        OI3["**menu_id (FK)"]
        OI4["quantity"]
        OI5["price"]
        OI6["subtotal"]
        OI7["note"]
        OI8["created_at"]
        OI9["updated_at"]
    end

    C1 -->|"1 : M"| M2
    T1 -->|"1 : M"| O3
    O1 -->|"1 : M"| OI2
    M1 -->|"1 : M"| OI3
```

## Keterangan Simbol

| Simbol | Arti |
|--------|------|
| `*` (satu bintang) | Primary Key |
| `**` (dua bintang) | Foreign Key |
| `1 : M` | Relasi One to Many |

## Daftar Tabel dan Jumlah Field

| No | Nama Tabel | Jumlah Field | Keterangan |
|----|------------|--------------|------------|
| 1 | users | 7 | Tabel data pengguna (admin & kasir) |
| 2 | categories | 5 | Tabel kategori menu |
| 3 | menus | 9 | Tabel daftar menu makanan & minuman |
| 4 | tables | 6 | Tabel data meja restoran |
| 5 | orders | 11 | Tabel data pesanan |
| 6 | order_items | 9 | Tabel detail item pesanan |
