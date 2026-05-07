import { useState, useEffect, useRef } from 'react';
import { tableAPI, UPLOADS_URL } from '../../services/api';
import { MdAdd, MdDelete, MdQrCode2, MdToggleOn, MdToggleOff, MdRefresh, MdPrint, MdDownload } from 'react-icons/md';
import toast from 'react-hot-toast';

const TableManagement = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nomorMeja, setNomorMeja] = useState('');
  const [showQR, setShowQR] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [printCards, setPrintCards] = useState(null);
  const [regenerating, setRegenerating] = useState(false);
  const printRef = useRef(null);

  const fetchTables = async () => {
    try {
      const res = await tableAPI.getAll();
      setTables(res.data);
    } catch (err) {
      toast.error('Gagal memuat data meja');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTables(); }, []);

  const handleAdd = async () => {
    if (!nomorMeja) return toast.error('Nomor meja harus diisi');
    try {
      await tableAPI.create({ nomor_meja: parseInt(nomorMeja) });
      toast.success('Meja & QR Code berhasil dibuat');
      setNomorMeja('');
      fetchTables();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menambah meja');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus meja ini?')) return;
    try {
      await tableAPI.delete(id);
      toast.success('Meja berhasil dihapus');
      fetchTables();
    } catch (err) {
      toast.error('Gagal menghapus meja');
    }
  };

  const handleToggle = async (id) => {
    try {
      await tableAPI.toggleStatus(id);
      fetchTables();
    } catch (err) {
      toast.error('Gagal mengubah status');
    }
  };

  // Open QR Modal with data URL from server
  const handleShowQR = async (table) => {
    setShowQR(table);
    setQrLoading(true);
    setQrDataUrl(null);
    try {
      const res = await tableAPI.getQRData(table.id);
      setQrDataUrl(res.data);
    } catch (err) {
      toast.error('Gagal memuat QR Code');
    } finally {
      setQrLoading(false);
    }
  };

  // Regenerate QR for single table
  const handleRegenerateQR = async (tableId) => {
    try {
      await tableAPI.regenerateQR(tableId);
      toast.success('QR Code berhasil di-generate ulang');
      fetchTables();
      if (showQR && showQR.id === tableId) {
        handleShowQR(showQR);
      }
    } catch (err) {
      toast.error('Gagal regenerate QR');
    }
  };

  // Regenerate ALL QR codes
  const handleRegenerateAll = async () => {
    if (!confirm('Generate ulang QR Code untuk semua meja?')) return;
    setRegenerating(true);
    try {
      const res = await tableAPI.regenerateAllQR();
      toast.success(res.data.message);
      fetchTables();
    } catch (err) {
      toast.error('Gagal regenerate semua QR');
    } finally {
      setRegenerating(false);
    }
  };

  // Download single QR as PNG
  const handleDownloadQR = (dataUrl, nomorMeja) => {
    const link = document.createElement('a');
    link.download = `QR-Ponbean-Meja-${nomorMeja}.png`;
    link.href = dataUrl;
    link.click();
  };

  // Print QR cards
  const handlePrintAll = async () => {
    try {
      const res = await tableAPI.getQRPrintCards('all');
      setPrintCards(res.data);
      // Wait for state to update, then trigger print
      setTimeout(() => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(generatePrintHTML(res.data));
          printWindow.document.close();
          printWindow.onload = () => {
            printWindow.print();
          };
        }
      }, 100);
    } catch (err) {
      toast.error('Gagal memuat data print');
    }
  };

  // Print single QR card
  const handlePrintSingle = (qrData) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(generatePrintHTML([qrData]));
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  // Generate printable HTML
  const generatePrintHTML = (cards) => {
    const cardsHTML = cards.map(card => `
      <div class="qr-card">
        <div class="qr-card-header">
          <div class="cafe-logo">☕</div>
          <h2 class="cafe-name">Ponbean Coffee</h2>
        </div>
        <div class="qr-image-wrapper">
          <img src="${card.qr_data_url}" alt="QR Code Meja ${card.nomor_meja}" class="qr-image" />
        </div>
        <div class="qr-card-info">
          <h3 class="table-number">Meja ${card.nomor_meja}</h3>
          <p class="scan-text">Scan untuk melihat menu</p>
          <p class="scan-subtext">& langsung pesan dari HP Anda</p>
        </div>
        <div class="qr-card-footer">
          <div class="wifi-icon">📶</div>
          <span>Tidak perlu download aplikasi</span>
        </div>
      </div>
    `).join('');

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>QR Code - Ponbean Coffee</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Inter', sans-serif;
      background: #f5f5f5;
      padding: 20px;
    }

    .print-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
      max-width: 800px;
      margin: 0 auto;
    }

    .qr-card {
      background: white;
      border-radius: 20px;
      padding: 32px 24px 24px;
      text-align: center;
      border: 2px solid #e5e5e5;
      page-break-inside: avoid;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }

    .qr-card-header {
      margin-bottom: 20px;
    }

    .cafe-logo {
      font-size: 32px;
      margin-bottom: 6px;
    }

    .cafe-name {
      font-size: 18px;
      font-weight: 800;
      color: #8B6E4E;
      letter-spacing: -0.5px;
    }

    .qr-image-wrapper {
      background: #fafafa;
      border-radius: 16px;
      padding: 16px;
      margin: 0 auto 20px;
      display: inline-block;
      border: 1px solid #eee;
    }

    .qr-image {
      width: 200px;
      height: 200px;
      display: block;
    }

    .qr-card-info {
      margin-bottom: 16px;
    }

    .table-number {
      font-size: 28px;
      font-weight: 900;
      color: #1a1a2e;
      margin-bottom: 6px;
    }

    .scan-text {
      font-size: 14px;
      font-weight: 600;
      color: #555;
    }

    .scan-subtext {
      font-size: 12px;
      color: #888;
      margin-top: 2px;
    }

    .qr-card-footer {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding-top: 12px;
      border-top: 1px dashed #ddd;
      font-size: 11px;
      color: #999;
    }

    .wifi-icon { font-size: 14px; }

    @media print {
      body { padding: 0; background: white; }
      .print-grid { gap: 16px; }
      .qr-card { 
        box-shadow: none; 
        border: 1.5px solid #ccc;
        break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="print-grid">
    ${cardsHTML}
  </div>
</body>
</html>`;
  };

  const clientUrl = import.meta.env.VITE_APP_URL || 'http://localhost:5173';

  if (loading) {
    return <div className="loading-page" style={{ minHeight: 'auto', padding: '60px' }}><div className="spinner" /></div>;
  }

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">Kelola Meja & QR Code</h1>
          <p className="page-subtitle">{tables.length} meja terdaftar</p>
        </div>
        <div className="flex gap-sm">
          <button
            className="btn btn-secondary"
            onClick={handleRegenerateAll}
            disabled={regenerating}
          >
            <MdRefresh className={regenerating ? 'spin' : ''} />
            {regenerating ? 'Generating...' : 'Regenerate Semua QR'}
          </button>
          <button className="btn btn-primary" onClick={handlePrintAll}>
            <MdPrint /> Print Semua QR
          </button>
        </div>
      </div>

      {/* Add Table */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px' }}>Tambah Meja Baru</h3>
        <div className="flex gap-md" style={{ alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1, maxWidth: '240px' }}>
            <label className="form-label">Nomor Meja</label>
            <input
              className="form-input"
              type="number"
              min="1"
              value={nomorMeja}
              onChange={(e) => setNomorMeja(e.target.value)}
              placeholder="Contoh: 11"
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
          </div>
          <button className="btn btn-primary" onClick={handleAdd}>
            <MdAdd /> Tambah Meja
          </button>
        </div>
        <p className="text-xs text-muted" style={{ marginTop: '8px' }}>
          QR Code akan otomatis di-generate saat meja ditambahkan
        </p>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-4">
        {tables.map((table) => (
          <div key={table.id} className="card" style={{ textAlign: 'center', position: 'relative' }}>
            {/* QR Preview Thumbnail */}
            <div
              style={{
                width: '80px',
                height: '80px',
                margin: '0 auto 12px',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                cursor: 'pointer',
                background: table.qr_code ? 'white' : 'var(--bg-elevated)',
                padding: table.qr_code ? '4px' : '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all var(--transition-base)',
                border: '2px solid var(--border)',
              }}
              onClick={() => handleShowQR(table)}
              title="Klik untuk lihat QR Code"
            >
              {table.qr_code ? (
                <img
                  src={`${UPLOADS_URL}/${table.qr_code}`}
                  alt={`QR Meja ${table.nomor_meja}`}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              ) : (
                <MdQrCode2 size={32} style={{ color: 'var(--text-muted)' }} />
              )}
            </div>

            <h4 style={{ fontWeight: 700, fontSize: '1rem' }}>Meja {table.nomor_meja}</h4>
            <span
              className={`badge ${table.is_active ? 'badge-success' : 'badge-danger'}`}
              style={{ marginTop: '6px' }}
            >
              {table.is_active ? 'Aktif' : 'Nonaktif'}
            </span>

            {/* Status QR */}
            <p className="text-xs" style={{
              marginTop: '8px',
              color: table.qr_code ? 'var(--success)' : 'var(--warning)',
            }}>
              {table.qr_code ? '✓ QR Ready' : '⚠ QR belum ada'}
            </p>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '4px', marginTop: '12px', justifyContent: 'center' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleShowQR(table)}
                title="Lihat QR Code"
              >
                <MdQrCode2 /> QR
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => handleToggle(table.id)}
                title={table.is_active ? 'Nonaktifkan' : 'Aktifkan'}
              >
                {table.is_active ? <MdToggleOff /> : <MdToggleOn />}
              </button>
              <button
                className="btn btn-ghost btn-sm"
                style={{ color: 'var(--danger)' }}
                onClick={() => handleDelete(table.id)}
                title="Hapus Meja"
              >
                <MdDelete />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* QR Modal */}
      {showQR && (
        <div className="modal-overlay" onClick={() => setShowQR(null)}>
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            style={{ textAlign: 'center', maxWidth: '460px' }}
          >
            <div className="modal-header">
              <h2 className="modal-title">QR Code — Meja {showQR.nomor_meja}</h2>
              <button className="btn btn-ghost btn-icon sm" onClick={() => setShowQR(null)}>✕</button>
            </div>

            {qrLoading ? (
              <div style={{ padding: '40px' }}>
                <div className="spinner" style={{ margin: '0 auto' }} />
                <p className="text-muted text-sm" style={{ marginTop: '12px' }}>Generating QR Code...</p>
              </div>
            ) : qrDataUrl ? (
              <>
                {/* QR Image */}
                <div style={{
                  background: 'white',
                  borderRadius: 'var(--radius-lg)',
                  padding: '24px',
                  display: 'inline-block',
                  margin: '0 auto',
                }}>
                  <img
                    src={qrDataUrl.qr_data_url}
                    alt={`QR Meja ${showQR.nomor_meja}`}
                    style={{ width: '220px', height: '220px' }}
                  />
                </div>

                {/* Info */}
                <div style={{ marginTop: '20px' }}>
                  <p className="text-sm" style={{ fontWeight: 600 }}>
                    Scan QR ini untuk mengakses menu
                  </p>
                  <p className="text-xs" style={{
                    color: 'var(--primary)',
                    marginTop: '6px',
                    padding: '6px 12px',
                    background: 'var(--primary-glow)',
                    borderRadius: 'var(--radius-full)',
                    display: 'inline-block',
                    wordBreak: 'break-all',
                  }}>
                    {qrDataUrl.menu_url}
                  </p>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '24px', justifyContent: 'center' }}>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleDownloadQR(qrDataUrl.qr_data_url, showQR.nomor_meja)}
                  >
                    <MdDownload /> Download PNG
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => handlePrintSingle(qrDataUrl)}
                  >
                    <MdPrint /> Print Card
                  </button>
                  <button
                    className="btn btn-ghost"
                    onClick={() => handleRegenerateQR(showQR.id)}
                  >
                    <MdRefresh /> Regenerate
                  </button>
                </div>
              </>
            ) : (
              <div style={{ padding: '40px' }}>
                <MdQrCode2 size={48} style={{ color: 'var(--text-muted)', margin: '0 auto' }} />
                <p className="text-muted" style={{ marginTop: '12px' }}>
                  QR Code belum tersedia
                </p>
                <button
                  className="btn btn-primary"
                  style={{ marginTop: '16px' }}
                  onClick={() => handleRegenerateQR(showQR.id)}
                >
                  <MdRefresh /> Generate QR Code
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default TableManagement;
