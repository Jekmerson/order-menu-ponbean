import { useState, useEffect } from 'react';
import { orderAPI } from '../../services/api';
import { formatRupiah, formatTime, getStatusBadge } from '../../utils/helpers';
import { MdRefresh, MdCheckCircle, MdRestaurant, MdDone } from 'react-icons/md';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const KasirDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');

  const fetchOrders = async () => {
    try {
      const res = await orderAPI.getAll();
      setOrders(res.data);
    } catch (err) {
      toast.error('Gagal memuat pesanan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000');

    socket.on('new_order', (newOrder) => {
      setOrders((prev) => [newOrder, ...prev]);
      toast('🔔 Pesanan baru masuk!', {
        style: { background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--primary)' },
        duration: 5000,
      });
      // Play notification sound
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1sZmVzfH18cHFtZX+Nk4uAd3Zxb4KUmpGHfXx4dIWXnZSKgH15d4eaoZeLgnx7eIibopiNhIB9fIqcpJqQh4OBf4ydpp2UjYiFhI+hqaCZkoyIh5KkrKSdl5GLipWnr6ihnJWPjZmssq2moZqUk52vtLCqpZ6YmKG0t7OtqKKdnqW3u7avtaulpKq6vrizr6ynqK+/wry2sq2rr7XDx8K8t7Kwr7nHy8bAvbizs7vM0MvGwb24tb7R1M/KxcC8ucLP19TPysXBvsPV2tfRzMfDwcna3trVz8vIxs3d4d3X0s3KyNHg5ODb1tHNy9Xj5+Pd2NTQ0Nnm6uXg29fU09zq7ejj3trX1t/t8+7p5ODc2+Lw9fDr5+Pg3+b0+fXw7Ojl5On3/Pj08Orn6e3+');
        audio.volume = 0.5;
        audio.play().catch(() => {});
      } catch (e) {}
    });

    socket.on('order_updated', (updatedOrder) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
      );
    });

    return () => socket.disconnect();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await orderAPI.updateStatus(orderId, newStatus);
      toast.success('Status pesanan diperbarui');
    } catch (err) {
      toast.error('Gagal memperbarui status');
    }
  };

  const handlePrintReceipt = (order) => {
    const fmtRp = (v) => 'Rp ' + parseInt(v).toLocaleString('id-ID');
    const itemsHTML = order.items?.map(i => `
      <tr><td style="padding:4px 0">${i.menu?.nama || 'Menu'}</td>
      <td style="text-align:center;padding:4px 8px">${i.quantity}</td>
      <td style="text-align:right;padding:4px 0">${fmtRp(i.subtotal)}</td></tr>
    `).join('');
    const d = new Date(order.created_at || order.createdAt);
    const pw = window.open('', '_blank');
    if (!pw) return;
    pw.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Struk ${order.order_number}</title>
<style>@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap');
*{margin:0;padding:0;box-sizing:border-box}body{font-family:'JetBrains Mono',monospace;width:80mm;margin:0 auto;padding:8mm 6mm;font-size:11px;color:#111}
.center{text-align:center}.div{border-top:1px dashed #999;margin:8px 0}.bold{font-weight:700}
.r{display:flex;justify-content:space-between;margin:2px 0}table{width:100%;border-collapse:collapse}
.t{font-size:14px;font-weight:700}.f{text-align:center;margin-top:12px;font-size:10px;color:#888}
@media print{body{width:80mm;margin:0;padding:4mm 3mm}@page{size:80mm auto;margin:0}}</style></head><body>
<div class="center"><div style="font-size:18px;font-weight:700">☕ Ponbean Coffee</div><div style="font-size:10px;color:#666">Kafe & Tempat Nongkrong</div></div>
<div class="div"></div>
<div class="r"><span>No. Order:</span><span class="bold">${order.order_number}</span></div>
<div class="r"><span>Meja:</span><span>${order.table?.nomor_meja || '-'}</span></div>
${order.customer_name ? `<div class="r"><span>Nama:</span><span>${order.customer_name}</span></div>` : ''}
<div class="r"><span>Tanggal:</span><span>${d.toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'})}</span></div>
<div class="r"><span>Waktu:</span><span>${d.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})}</span></div>
<div class="div"></div>
<table><thead><tr><th style="text-align:left;padding:4px 0">Item</th><th style="text-align:center;padding:4px 8px">Qty</th><th style="text-align:right;padding:4px 0">Harga</th></tr></thead>
<tbody>${itemsHTML}</tbody></table>
<div class="div"></div>
<div class="r t"><span>TOTAL</span><span>${fmtRp(order.total_amount)}</span></div>
<div class="r"><span>Status:</span><span>${order.status === 'completed' ? '✓ LUNAS' : order.status?.toUpperCase()}</span></div>
${order.note ? `<div class="div"></div><div style="font-size:10px"><b>Catatan:</b> ${order.note}</div>` : ''}
<div class="div"></div>
<div class="f">Terima kasih telah berkunjung!<br>☕ Ponbean Coffee ☕</div>
</body></html>`);
    pw.document.close();
    pw.onload = () => pw.print();
  };

  const filteredOrders = orders.filter((o) => {
    if (filter === 'active') return ['paid', 'processing'].includes(o.status);
    if (filter === 'pending') return o.status === 'pending_payment';
    if (filter === 'completed') return o.status === 'completed';
    return true;
  });

  const activeCount = orders.filter((o) => ['paid', 'processing'].includes(o.status)).length;
  const pendingCount = orders.filter((o) => o.status === 'pending_payment').length;

  if (loading) {
    return (
      <div className="loading-page" style={{ minHeight: 'auto', padding: '60px 0' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">Pesanan Masuk</h1>
          <p className="page-subtitle">
            {activeCount} pesanan aktif · {pendingCount} menunggu bayar
          </p>
        </div>
        <button className="btn btn-secondary" onClick={fetchOrders}>
          <MdRefresh /> Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="category-tabs" style={{ marginBottom: '24px' }}>
        {[
          { key: 'active', label: `Aktif (${activeCount})` },
          { key: 'pending', label: `Menunggu Bayar (${pendingCount})` },
          { key: 'completed', label: 'Selesai' },
          { key: 'all', label: 'Semua' },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`category-tab ${filter === tab.key ? 'active' : ''}`}
            onClick={() => setFilter(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3 className="empty-state-title">Belum ada pesanan</h3>
          <p className="empty-state-text">Pesanan akan muncul di sini secara real-time</p>
        </div>
      ) : (
        <div className="grid grid-3">
          {filteredOrders.map((order) => {
            const status = getStatusBadge(order.status);
            return (
              <div key={order.id} className="order-card animate-fade-in">
                <div className="order-card-header">
                  <div>
                    <div className="order-number">{order.order_number}</div>
                    <div className="order-table">🪑 Meja {order.table?.nomor_meja}</div>
                    {order.customer_name && (
                      <div className="text-xs text-muted" style={{ marginTop: '2px' }}>
                        👤 {order.customer_name}
                      </div>
                    )}
                  </div>
                  <span className={`badge ${status.className}`}>{status.label}</span>
                </div>

                <div className="order-items-list">
                  {order.items?.map((item) => (
                    <div key={item.id} className="order-item-row">
                      <span>
                        <strong>{item.quantity}x</strong> {item.menu?.nama || 'Menu'}
                      </span>
                      <span className="text-muted">{formatRupiah(item.subtotal)}</span>
                    </div>
                  ))}
                </div>

                {order.note && (
                  <div style={{
                    padding: '8px 12px',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '12px',
                  }}>
                    📝 {order.note}
                  </div>
                )}

                <div className="order-total">
                  <span>Total</span>
                  <span style={{ color: 'var(--primary)' }}>{formatRupiah(order.total_amount)}</span>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                  {formatTime(order.created_at || order.createdAt)}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  {order.status === 'paid' && (
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1 }}
                      onClick={() => handleUpdateStatus(order.id, 'processing')}
                    >
                      <MdRestaurant size={16} /> Proses
                    </button>
                  )}
                  {order.status === 'processing' && (
                    <button
                      className="btn btn-success btn-sm"
                      style={{ flex: 1 }}
                      onClick={() => handleUpdateStatus(order.id, 'completed')}
                    >
                      <MdDone size={16} /> Selesai
                    </button>
                  )}
                  {order.status === 'pending_payment' && (
                    <>
                      <button
                        className="btn btn-success btn-sm"
                        style={{ flex: 1 }}
                        onClick={() => handleUpdateStatus(order.id, 'paid')}
                      >
                        <MdCheckCircle size={16} /> Konfirmasi Bayar
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                      >
                        Batal
                      </button>
                    </>
                  )}
                  {['paid', 'processing', 'completed'].includes(order.status) && (
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => handlePrintReceipt(order)}
                      title="Cetak Struk"
                    >
                      🧾
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default KasirDashboard;
