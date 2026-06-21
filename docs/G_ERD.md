# G. Entity Relationship Diagram (ERD)

## Penjelasan

Entity Relationship Diagram (ERD) menggambarkan hubungan antar entitas dalam database **ponbean_db** yang digunakan pada Aplikasi Order Menu Ponbean. Database ini menggunakan MySQL melalui Sequelize ORM dan terdiri atas 6 tabel utama.

## Diagram ERD

```mermaid
erDiagram
    USERS {
        INT id PK "Primary Key, Auto Increment"
        VARCHAR(100) nama "NOT NULL"
        VARCHAR(50) username "NOT NULL, UNIQUE"
        VARCHAR(255) password "NOT NULL"
        ENUM role "admin / kasir, DEFAULT kasir"
        DATETIME created_at "Timestamps"
        DATETIME updated_at "Timestamps"
    }

    CATEGORIES {
        INT id PK "Primary Key, Auto Increment"
        VARCHAR(100) nama "NOT NULL"
        VARCHAR(50) icon "DEFAULT 🍽️"
        DATETIME created_at "Timestamps"
        DATETIME updated_at "Timestamps"
    }

    MENUS {
        INT id PK "Primary Key, Auto Increment"
        INT category_id FK "NOT NULL → categories.id"
        VARCHAR(150) nama "NOT NULL"
        TEXT deskripsi "NULL"
        DECIMAL(10_0) harga "NOT NULL"
        VARCHAR(255) gambar "NULL"
        BOOLEAN is_available "DEFAULT true"
        DATETIME created_at "Timestamps"
        DATETIME updated_at "Timestamps"
    }

    TABLES {
        INT id PK "Primary Key, Auto Increment"
        INT nomor_meja "NOT NULL, UNIQUE"
        VARCHAR(255) qr_code "NULL"
        BOOLEAN is_active "DEFAULT true"
        DATETIME created_at "Timestamps"
        DATETIME updated_at "Timestamps"
    }

    ORDERS {
        INT id PK "Primary Key, Auto Increment"
        VARCHAR(30) order_number "NOT NULL, UNIQUE"
        INT table_id FK "NOT NULL → tables.id"
        VARCHAR(100) customer_name "NULL"
        ENUM status "pending_payment / paid / processing / completed / cancelled"
        VARCHAR(50) payment_method "NULL"
        VARCHAR(100) payment_id "NULL"
        DECIMAL(12_0) total_amount "NOT NULL, DEFAULT 0"
        TEXT note "NULL"
        DATETIME created_at "Timestamps"
        DATETIME updated_at "Timestamps"
    }

    ORDER_ITEMS {
        INT id PK "Primary Key, Auto Increment"
        INT order_id FK "NOT NULL → orders.id"
        INT menu_id FK "NOT NULL → menus.id"
        INT quantity "NOT NULL, DEFAULT 1"
        DECIMAL(10_0) price "NOT NULL"
        DECIMAL(12_0) subtotal "NOT NULL"
        TEXT note "NULL"
        DATETIME created_at "Timestamps"
        DATETIME updated_at "Timestamps"
    }

    CATEGORIES ||--o{ MENUS : "has many"
    TABLES ||--o{ ORDERS : "has many"
    ORDERS ||--o{ ORDER_ITEMS : "has many"
    MENUS ||--o{ ORDER_ITEMS : "has many"
```

## Keterangan Relasi

| No | Relasi | Tipe | Keterangan |
|----|--------|------|------------|
| 1 | CATEGORIES → MENUS | One to Many | Satu kategori memiliki banyak menu |
| 2 | TABLES → ORDERS | One to Many | Satu meja memiliki banyak pesanan |
| 3 | ORDERS → ORDER_ITEMS | One to Many | Satu pesanan memiliki banyak item |
| 4 | MENUS → ORDER_ITEMS | One to Many | Satu menu dapat muncul di banyak item pesanan |

> [!NOTE]
> Tabel `USERS` berdiri sendiri (tidak memiliki relasi foreign key ke tabel lain) karena berfungsi sebagai tabel autentikasi untuk admin dan kasir.
