import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { orderAPI, paymentAPI } from '../../services/api';
import { formatRupiah, formatDateTime, getStatusBadge } from '../../utils/helpers';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const OrderStatusPage = () => {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await orderAPI.getById(orderNumber);
        setOrder(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();

    // Listen for real-time updates
    const SOCKET_URL = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace('/api', '') 
      : `http://${window.location.hostname}:5000`;
    const socket = io(SOCKET_URL);
    socket.on('order_updated', (updatedOrder) => {
      if (updatedOrder.order_number === orderNumber || String(updatedOrder.id) === orderNumber) {
        setOrder(updatedOrder);
      }
    });

    return () => socket.disconnect();
  }, [orderNumber]);

  // Midtrans Snap Payment
  const handlePayMidtrans = async () => {
    setPaying(true);
    try {
      const res = await paymentAPI.create({ order_id: order.id });
      const snapToken = res.data.snap_token;

      // Check if Snap is loaded
      if (window.snap) {
        window.snap.pay(snapToken, {
          onSuccess: () => {
            toast.success('Pembayaran berhasil!');
            setTimeout(() => window.location.reload(), 1000);
          },
          onPending: () => {
            toast('Menunggu pembayaran...', { icon: '⏳' });
          },
          onError: () => {
            toast.error('Pembayaran gagal');
          },
          onClose: () => {
            setPaying(false);
          },
        });
      } else {
        // Fallback to redirect
        window.open(res.data.redirect_url, '_blank');
        setPaying(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memproses pembayaran');
      setPaying(false);
    }
  };

  // Print receipt
  const handlePrintReceipt = () => {
    if (!order) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(generateReceiptHTML(order));
      printWindow.document.close();
      printWindow.onload = () => printWindow.print();
    }
  };

  const generateReceiptHTML = (order) => {
    const itemsHTML = order.items?.map(item => `
      <tr>
        <td style="padding:4px 0">${item.menu?.nama || 'Menu'}</td>
        <td style="text-align:center;padding:4px 8px">${item.quantity}</td>
        <td style="text-align:right;padding:4px 0">${formatRupiahPlain(item.subtotal)}</td>
      </tr>
    `).join('');

    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Struk ${order.order_number}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'JetBrains Mono',monospace; width:80mm; margin:0 auto; padding:8mm 6mm; font-size:11px; color:#111; }
  .center { text-align:center; }
  .divider { border-top:1px dashed #999; margin:8px 0; }
  .bold { font-weight:700; }
  .cafe-name { font-size:18px; font-weight:700; margin-bottom:2px; }
  .cafe-sub { font-size:10px; color:#666; }
  .info-row { display:flex; justify-content:space-between; margin:2px 0; }
  table { width:100%; border-collapse:collapse; }
  .total-row { font-size:14px; font-weight:700; }
  .footer { text-align:center; margin-top:12px; font-size:10px; color:#888; }
  @media print {
    body { width:80mm; margin:0; padding:4mm 3mm; }
    @page { size:80mm auto; margin:0; }
  }
</style></head><body>
  <div class="center">
    <div class="cafe-name">☕ Ponbean Coffee</div>
    <div class="cafe-sub">Kafe & Tempat Nongkrong</div>
  </div>
  <div class="divider"></div>
  <div class="info-row"><span>No. Order:</span><span class="bold">${order.order_number}</span></div>
  <div class="info-row"><span>Meja:</span><span>${order.table?.nomor_meja || '-'}</span></div>
  ${order.customer_name ? `<div class="info-row"><span>Nama:</span><span>${order.customer_name}</span></div>` : ''}
  <div class="info-row"><span>Tanggal:</span><span>${new Date(order.created_at || order.createdAt).toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' })}</span></div>
  <div class="info-row"><span>Waktu:</span><span>${new Date(order.created_at || order.createdAt).toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' })}</span></div>
  <div class="divider"></div>
  <table>
    <thead><tr><th style="text-align:left;padding:4px 0">Item</th><th style="text-align:center;padding:4px 8px">Qty</th><th style="text-align:right;padding:4px 0">Harga</th></tr></thead>
    <tbody>${itemsHTML}</tbody>
  </table>
  <div class="divider"></div>
  <div class="info-row total-row"><span>TOTAL</span><span>${formatRupiahPlain(order.total_amount)}</span></div>
  <div class="info-row"><span>Pembayaran:</span><span>${order.payment_method === 'midtrans' ? 'Online (Midtrans)' : order.payment_method || 'Kasir'}</span></div>
  <div class="info-row"><span>Status:</span><span>${order.status === 'completed' ? '✓ LUNAS' : order.status?.toUpperCase()}</span></div>
  ${order.note ? `<div class="divider"></div><div style="font-size:10px"><b>Catatan:</b> ${order.note}</div>` : ''}
  <div class="divider"></div>
  <div class="footer">
    Terima kasih telah berkunjung!<br>
    ☕ Ponbean Coffee ☕
  </div>
</body></html>`;
  };

  // Simple rupiah formatter for receipt (no JSX)
  const formatRupiahPlain = (val) => {
    return 'Rp ' + parseInt(val).toLocaleString('id-ID');
  };

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner" />
        <span className="text-muted">Memuat pesanan...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="loading-page">
        <div className="empty-state-icon">🔍</div>
        <h2>Pesanan tidak ditemukan</h2>
      </div>
    );
  }

  const steps = [
    { key: 'pending_payment', label: 'Menunggu Bayar', icon: '💳' },
    { key: 'paid', label: 'Sudah Bayar', icon: '✅' },
    { key: 'processing', label: 'Sedang Diproses', icon: '👨‍🍳' },
    { key: 'completed', label: 'Selesai', icon: '🎉' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === order.status);

  return (
    <div className="customer-layout">
      <header className="customer-header">
        <div className="customer-header-content">
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
              <span style={{ color: 'var(--primary)' }}>Ponbean</span> Coffee
            </h1>
            <p className="text-xs text-muted">Status Pesanan</p>
          </div>
        </div>
      </header>

      <div className="customer-body animate-slide-up">
        {/* Order Number */}
        <div className="card" style={{ textAlign: 'center', marginBottom: '20px' }}>
          <p className="text-muted text-sm" style={{ marginBottom: '4px' }}>Nomor Pesanan</p>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>
            {order.order_number}
          </h2>
          <p className="text-xs text-muted" style={{ marginTop: '8px' }}>
            Meja {order.table?.nomor_meja} · {formatDateTime(order.created_at || order.createdAt)}
          </p>
        </div>

        {/* Status Steps */}
        {order.status !== 'cancelled' && (
          <div className="card" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', padding: '0 8px' }}>
              {/* Progress Line */}
              <div style={{
                position: 'absolute', top: '20px', left: '32px', right: '32px',
                height: '3px', background: 'var(--border)', zIndex: 0,
              }}>
                <div style={{
                  width: `${(currentStepIndex / (steps.length - 1)) * 100}%`,
                  height: '100%', background: 'var(--primary)',
                  borderRadius: '4px', transition: 'width 0.5s ease',
                }} />
              </div>
              {steps.map((step, i) => (
                <div key={step.key} style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: i <= currentStepIndex ? 'var(--primary)' : 'var(--bg-elevated)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.1rem', margin: '0 auto 8px', transition: 'all 0.3s ease',
                    boxShadow: i === currentStepIndex ? '0 0 15px var(--primary-glow)' : 'none',
                  }}>
                    {step.icon}
                  </div>
                  <p style={{
                    fontSize: '0.65rem',
                    fontWeight: i <= currentStepIndex ? 600 : 400,
                    color: i <= currentStepIndex ? 'var(--text-primary)' : 'var(--text-muted)',
                    maxWidth: '70px',
                  }}>
                    {step.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {order.status === 'cancelled' && (
          <div className="card" style={{ textAlign: 'center', marginBottom: '20px', borderColor: 'var(--danger)' }}>
            <p style={{ fontSize: '2rem' }}>❌</p>
            <h3 style={{ color: 'var(--danger)' }}>Pesanan Dibatalkan</h3>
          </div>
        )}

        {/* Payment Button (Midtrans) */}
        {order.status === 'pending_payment' && (
          <div className="card" style={{ textAlign: 'center', marginBottom: '20px' }}>
            <p style={{ fontSize: '2rem', marginBottom: '8px' }}>💳</p>
            <h3 style={{ fontWeight: 700, marginBottom: '4px' }}>Bayar Sekarang</h3>
            <p className="text-sm text-muted" style={{ marginBottom: '16px' }}>
              Pilih metode pembayaran favorit Anda
            </p>
            <button
              className="btn btn-primary btn-lg"
              style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
              onClick={handlePayMidtrans}
              disabled={paying}
            >
              {paying ? 'Memproses...' : `Bayar ${formatRupiah(order.total_amount)}`}
            </button>
            <p className="text-xs text-muted" style={{ marginTop: '10px' }}>
              🔒 Pembayaran aman via Midtrans (VA, QRIS, e-Wallet)
            </p>
          </div>
        )}

        {/* Order Items */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>Detail Pesanan</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {order.items?.map((item) => (
              <div key={item.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                paddingBottom: '12px', borderBottom: '1px solid var(--border)',
              }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.menu?.nama || 'Menu'}</p>
                  <p className="text-xs text-muted">{item.quantity}x {formatRupiah(item.price)}</p>
                </div>
                <span style={{ fontWeight: 600 }}>{formatRupiah(item.subtotal)}</span>
              </div>
            ))}
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            paddingTop: '16px', fontSize: '1.1rem', fontWeight: 800,
          }}>
            <span>Total</span>
            <span style={{ color: 'var(--primary)' }}>{formatRupiah(order.total_amount)}</span>
          </div>
        </div>

        {order.note && (
          <div className="card" style={{ marginTop: '12px' }}>
            <p className="text-sm text-muted" style={{ marginBottom: '4px' }}>Catatan:</p>
            <p style={{ fontSize: '0.9rem' }}>{order.note}</p>
          </div>
        )}

        {/* Print Receipt Button - show when paid/completed */}
        {['paid', 'processing', 'completed'].includes(order.status) && (
          <button
            className="btn btn-secondary btn-lg"
            style={{ width: '100%', marginTop: '16px' }}
            onClick={handlePrintReceipt}
          >
            🧾 Cetak Struk
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderStatusPage;
