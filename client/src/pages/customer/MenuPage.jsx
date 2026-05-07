import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { menuAPI, tableAPI, UPLOADS_URL } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { formatRupiah } from '../../utils/helpers';
import { MdAdd, MdRemove, MdShoppingCart } from 'react-icons/md';
import CartDrawer from '../../components/CartDrawer';
import toast from 'react-hot-toast';

const MenuPage = () => {
  const { tableId } = useParams();
  const [menus, setMenus] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [tableInfo, setTableInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [error, setError] = useState(null);
  const { items, totalItems, totalPrice, addItem, updateQuantity, setTableId, setTableNumber } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [menuRes, catRes, tableRes] = await Promise.all([
          menuAPI.getAll({ available: 'true' }),
          menuAPI.getCategories(),
          tableAPI.getAll(),
        ]);

        setMenus(menuRes.data);
        setCategories(catRes.data);

        const table = tableRes.data.find((t) => t.id === parseInt(tableId));
        if (table) {
          setTableInfo(table);
          setTableId(table.id);
          setTableNumber(table.nomor_meja);
        } else {
          setError('Meja tidak ditemukan.');
        }
      } catch (err) {
        setError('Gagal memuat menu. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tableId, setTableId, setTableNumber]);

  const filteredMenus =
    activeCategory === 'all'
      ? menus
      : menus.filter((m) => m.category_id === parseInt(activeCategory));

  const getItemQty = (menuId) => {
    const item = items.find((i) => i.menu_id === menuId);
    return item ? item.quantity : 0;
  };

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner" />
        <span className="text-muted">Memuat menu...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loading-page">
        <div className="empty-state-icon">😕</div>
        <h2>{error}</h2>
        <p className="text-muted">Scan ulang QR Code di meja Anda.</p>
      </div>
    );
  }

  return (
    <div className="customer-layout">
      {/* Header */}
      <header className="customer-header">
        <div className="customer-header-content">
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
              <span style={{ color: 'var(--primary)' }}>Ponbean</span> Coffee
            </h1>
            <p className="text-xs text-muted">
              Meja {tableInfo?.nomor_meja}
            </p>
          </div>
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => setShowCart(true)}
            style={{ position: 'relative' }}
          >
            <MdShoppingCart size={22} />
            {totalItems > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: -2,
                  right: -2,
                  background: 'var(--danger)',
                  color: 'white',
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="customer-body">
        {/* Category Tabs */}
        <div className="category-tabs">
          <button
            className={`category-tab ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            🍽️ Semua
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`category-tab ${activeCategory === String(cat.id) ? 'active' : ''}`}
              onClick={() => setActiveCategory(String(cat.id))}
            >
              {cat.icon} {cat.nama}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        {filteredMenus.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🍃</div>
            <h3 className="empty-state-title">Belum ada menu</h3>
            <p className="empty-state-text">Menu sedang dipersiapkan</p>
          </div>
        ) : (
          <div className="grid grid-2" style={{ gap: '12px' }}>
            {filteredMenus.map((menu) => {
              const qty = getItemQty(menu.id);
              return (
                <div key={menu.id} className="menu-card animate-fade-in">
                  <div
                    className="menu-card-image"
                    style={{
                      backgroundImage: menu.gambar
                        ? `url(${UPLOADS_URL}/${menu.gambar})`
                        : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2.5rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {!menu.gambar && '🍽️'}
                  </div>
                  <div className="menu-card-body">
                    <h3 className="menu-card-name">{menu.nama}</h3>
                    <p className="menu-card-desc">{menu.deskripsi}</p>
                    <div className="menu-card-footer">
                      <span className="menu-card-price">
                        {formatRupiah(menu.harga)}
                      </span>
                      {qty === 0 ? (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            addItem(menu);
                            toast.success(`${menu.nama} ditambahkan`, {
                              duration: 1500,
                              style: {
                                background: 'var(--bg-card)',
                                color: 'var(--text-primary)',
                                border: '1px solid var(--border)',
                              },
                            });
                          }}
                        >
                          <MdAdd /> Tambah
                        </button>
                      ) : (
                        <div className="qty-control">
                          <button
                            className="qty-btn"
                            onClick={() => updateQuantity(menu.id, qty - 1)}
                          >
                            <MdRemove />
                          </button>
                          <span className="qty-value">{qty}</span>
                          <button
                            className="qty-btn"
                            onClick={() => updateQuantity(menu.id, qty + 1)}
                          >
                            <MdAdd />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cart FAB */}
      {totalItems > 0 && (
        <button className="cart-fab" onClick={() => setShowCart(true)}>
          <MdShoppingCart size={20} />
          <span>Lihat Keranjang</span>
          <span style={{ margin: '0 8px', opacity: 0.6 }}>|</span>
          <span>{formatRupiah(totalPrice)}</span>
          <span className="cart-badge">{totalItems}</span>
        </button>
      )}

      {/* Cart Drawer */}
      {showCart && <CartDrawer onClose={() => setShowCart(false)} />}
    </div>
  );
};

export default MenuPage;
