import { useState, useEffect } from 'react';
import { reportAPI } from '../../services/api';
import { formatRupiah, formatDateTime } from '../../utils/helpers';
import { MdSearch, MdPrint } from 'react-icons/md';
import toast from 'react-hot-toast';

const LaporanPenjualan = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10));

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await reportAPI.get({ start_date: startDate, end_date: endDate });
      setReport(res.data);
    } catch (err) {
      toast.error('Gagal memuat laporan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReport(); }, []);

  const fmtRp = (v) => 'Rp ' + parseInt(v).toLocaleString('id-ID');
  const fmtDt = (d) => {
    const dt = new Date(d);
    return dt.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' ' + dt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const handlePrintReport = () => {
    if (!report) return;

    const bestSellerRows = report.bestSellers.map((item, i) => `
      <tr>
        <td style="padding:6px 8px;border-bottom:1px solid #eee">${i + 1}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;font-weight:600">${item.nama}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center">${item.qty}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right">${fmtRp(item.revenue)}</td>
      </tr>
    `).join('');

    const orderRows = report.orders.map(o => `
      <tr>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;font-weight:600">${o.order_number}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #eee">Meja ${o.table?.nomor_meja || '-'}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #eee">${fmtDt(o.created_at || o.createdAt)}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right;font-weight:600">${fmtRp(o.total_amount)}</td>
      </tr>
    `).join('');

    const htmlContent = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Laporan Penjualan - Ponbean Coffee</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Inter',sans-serif; padding:32px; color:#111; font-size:12px; }
  .header { text-align:center; margin-bottom:24px; border-bottom:2px solid #8B6E4E; padding-bottom:16px; }
  .header h1 { font-size:22px; font-weight:800; color:#8B6E4E; }
  .header p { color:#666; font-size:11px; margin-top:4px; }
  .period { font-size:13px; font-weight:600; color:#333; margin-top:8px; }
  .stats { display:flex; gap:16px; margin-bottom:24px; }
  .stat-box { flex:1; border:1px solid #ddd; border-radius:8px; padding:16px; text-align:center; }
  .stat-box .val { font-size:18px; font-weight:800; color:#111; }
  .stat-box .lbl { font-size:10px; color:#888; margin-top:4px; text-transform:uppercase; letter-spacing:0.5px; }
  h2 { font-size:14px; font-weight:700; margin:20px 0 10px; color:#333; }
  table { width:100%; border-collapse:collapse; font-size:11px; }
  th { text-align:left; padding:8px; background:#f5f5f5; font-weight:600; font-size:10px; text-transform:uppercase; letter-spacing:0.5px; color:#666; border-bottom:2px solid #ddd; }
  .footer { text-align:center; margin-top:32px; padding-top:16px; border-top:1px solid #ddd; font-size:10px; color:#999; }
  @media print { body { padding:16px; } @page { margin:10mm; } }
</style></head><body>
<div class="header">
  <h1>☕ Ponbean Coffee</h1>
  <p>Laporan Penjualan</p>
  <div class="period">Periode: ${startDate} s/d ${endDate}</div>
</div>
<div class="stats">
  <div class="stat-box"><div class="val">${fmtRp(report.totalRevenue)}</div><div class="lbl">Total Pendapatan</div></div>
  <div class="stat-box"><div class="val">${report.totalOrders}</div><div class="lbl">Total Pesanan</div></div>
  <div class="stat-box"><div class="val">${fmtRp(report.avgOrderValue)}</div><div class="lbl">Rata-rata / Pesanan</div></div>
</div>
<h2>🏆 Menu Terlaris</h2>
<table>
  <thead><tr><th>#</th><th>Menu</th><th style="text-align:center">Terjual</th><th style="text-align:right">Pendapatan</th></tr></thead>
  <tbody>${bestSellerRows || '<tr><td colspan="4" style="padding:12px;text-align:center;color:#999">Belum ada data</td></tr>'}</tbody>
</table>
<h2>📋 Detail Pesanan</h2>
<table>
  <thead><tr><th>No. Order</th><th>Meja</th><th>Waktu</th><th style="text-align:right">Total</th></tr></thead>
  <tbody>${orderRows || '<tr><td colspan="4" style="padding:12px;text-align:center;color:#999">Belum ada data</td></tr>'}</tbody>
</table>
<div style="text-align:right;margin-top:12px;font-size:13px;font-weight:700;padding:8px 0;border-top:2px solid #333">
  TOTAL: ${fmtRp(report.totalRevenue)}
</div>
<div class="footer">
  Dicetak pada ${new Date().toLocaleString('id-ID')}<br>
  Ponbean Coffee — Sistem Manajemen Kafe
</div>
</body></html>`;

    // Print via hidden iframe (no popup blocker)
    const existingFrame = document.getElementById('ponbean-print-frame');
    if (existingFrame) existingFrame.remove();

    const iframe = document.createElement('iframe');
    iframe.id = 'ponbean-print-frame';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    iframe.srcdoc = htmlContent;

    let printed = false;
    iframe.onload = () => {
      if (printed) return;
      printed = true;
      setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        setTimeout(() => iframe.remove(), 1000);
      }, 300);
    };

    document.body.appendChild(iframe);
  };

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">Laporan Penjualan</h1>
          <p className="page-subtitle">Analisis pendapatan dan menu terlaris</p>
        </div>
        {report && (
          <button className="btn btn-primary" onClick={handlePrintReport}>
            <MdPrint /> Cetak Laporan
          </button>
        )}
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="flex gap-md" style={{ alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group">
            <label className="form-label">Dari Tanggal</label>
            <input className="form-input" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Sampai Tanggal</label>
            <input className="form-input" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={fetchReport}><MdSearch /> Filter</button>
        </div>
      </div>

      {loading ? (
        <div className="loading-page" style={{ minHeight: 'auto', padding: '60px' }}><div className="spinner" /></div>
      ) : report && (
        <>
          <div className="grid grid-3" style={{ marginBottom: '24px' }}>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>💰</div>
              <div>
                <div className="stat-value">{formatRupiah(report.totalRevenue)}</div>
                <div className="stat-label">Total Pendapatan</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}>📋</div>
              <div>
                <div className="stat-value">{report.totalOrders}</div>
                <div className="stat-label">Total Pesanan</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>📊</div>
              <div>
                <div className="stat-value">{formatRupiah(report.avgOrderValue)}</div>
                <div className="stat-label">Rata-rata per Pesanan</div>
              </div>
            </div>
          </div>

          {/* Best Sellers */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>🏆 Menu Terlaris</h3>
            {report.bestSellers.length === 0 ? (
              <p className="text-muted">Belum ada data.</p>
            ) : (
              <div className="table-wrapper">
                <table className="table">
                  <thead><tr><th>#</th><th>Menu</th><th>Terjual</th><th>Pendapatan</th></tr></thead>
                  <tbody>
                    {report.bestSellers.map((item, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 700, color: i < 3 ? 'var(--accent)' : 'var(--text-muted)' }}>
                          {i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}
                        </td>
                        <td style={{ fontWeight: 600 }}>{item.nama}</td>
                        <td>{item.qty} porsi</td>
                        <td style={{ fontWeight: 600 }}>{formatRupiah(item.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Detailed Orders */}
          <div className="card">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>Detail Pesanan</h3>
            <div className="table-wrapper">
              <table className="table">
                <thead><tr><th>No. Order</th><th>Meja</th><th>Waktu</th><th>Total</th><th>Status</th></tr></thead>
                <tbody>
                  {report.orders.map((o) => (
                    <tr key={o.id}>
                      <td style={{ fontWeight: 600 }}>{o.order_number}</td>
                      <td>Meja {o.table?.nomor_meja}</td>
                      <td className="text-sm">{formatDateTime(o.created_at || o.createdAt)}</td>
                      <td style={{ fontWeight: 600 }}>{formatRupiah(o.total_amount)}</td>
                      <td><span className={`badge badge-success`}>Lunas</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LaporanPenjualan;
