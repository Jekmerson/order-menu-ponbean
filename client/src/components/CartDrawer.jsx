import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { orderAPI, UPLOADS_URL } from '../services/api';
import { formatRupiah } from '../utils/helpers';
import { MdClose, MdAdd, MdRemove, MdDelete, MdShoppingCart } from 'react-icons/md';
import toast from 'react-hot-toast';

const CartDrawer = ({ onClose }) => {
  const navigate = useNavigate();
  const {
    items, totalItems, totalPrice, tableId, tableNumber,
    updateQuantity, removeItem, clearCart,
  } = useCart();
  const [customerName, setCustomerName] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOrder = async () => {
    if (items.length === 0) return;
    setIsSubmitting(true);
    try {
      const orderData = {
        table_id: tableId,
        customer_name: customerName || null,
        note: note || null,
        items: items.map((item) => ({
          menu_id: item.menu_id,
          quantity: item.quantity,
          note: item.note || null,
        })),
      };
      const res = await orderAPI.create(orderData);
      clearCart();
      toast.success('Pesanan berhasil dibuat!');
      navigate(`/order/${res.data.order.order_number}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membuat pesanan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="cart-drawer"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '600px',
          maxHeight: '85vh',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideUp 0.3s ease',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
              <MdShoppingCart style={{ verticalAlign: 'middle', marginRight: 8 }} />
              Keranjang
            </h2>
            <p className="text-xs text-muted">Meja {tableNumber} · {totalItems} item</p>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <MdClose size={20} />
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {items.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <div className="empty-state-icon">🛒</div>
              <h3 className="empty-state-title">Keranjang kosong</h3>
              <p className="empty-state-text">Pilih menu terlebih dahulu</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {items.map((item) => (
                <div
                  key={item.menu_id}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    padding: '12px 0',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-elevated)',
                      backgroundImage: item.gambar ? `url(${UPLOADS_URL}/${item.gambar})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                    }}
                  >
                    {!item.gambar && '🍽️'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>{item.nama}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
                      {formatRupiah(item.harga)}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                      <div className="qty-control">
                        <button className="qty-btn" onClick={() => updateQuantity(item.menu_id, item.quantity - 1)}>
                          <MdRemove size={14} />
                        </button>
                        <span className="qty-value">{item.quantity}</span>
                        <button className="qty-btn" onClick={() => updateQuantity(item.menu_id, item.quantity + 1)}>
                          <MdAdd size={14} />
                        </button>
                      </div>
                      <button
                        className="btn btn-ghost btn-icon sm"
                        onClick={() => removeItem(item.menu_id)}
                        style={{ color: 'var(--danger)' }}
                      >
                        <MdDelete size={16} />
                      </button>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontWeight: 700, fontSize: '0.9rem' }}>
                    {formatRupiah(item.harga * item.quantity)}
                  </div>
                </div>
              ))}

              {/* Customer Name (optional) */}
              <div className="form-group" style={{ marginTop: '8px' }}>
                <label className="form-label">Nama (opsional)</label>
                <input
                  className="form-input"
                  placeholder="Nama Anda"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>

              {/* Note */}
              <div className="form-group">
                <label className="form-label">Catatan (opsional)</label>
                <textarea
                  className="form-textarea"
                  placeholder="Contoh: Tidak pedas, tanpa es..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{
            padding: '20px 24px',
            borderTop: '1px solid var(--border)',
            background: 'var(--bg-secondary)',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '16px',
              fontSize: '1.05rem',
              fontWeight: 700,
            }}>
              <span>Total</span>
              <span style={{ color: 'var(--primary)' }}>{formatRupiah(totalPrice)}</span>
            </div>
            <button
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              onClick={handleOrder}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Memproses...' : `Pesan Sekarang · ${formatRupiah(totalPrice)}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
