import { useState, useEffect } from 'react';
import { orderAPI, menuAPI, tableAPI } from '../../services/api';
import { formatRupiah } from '../../utils/helpers';
import { MdReceipt, MdRestaurantMenu, MdTableBar, MdTrendingUp } from 'react-icons/md';
import { io } from 'socket.io-client';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ orders: 0, menus: 0, tables: 0, revenue: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [ordersRes, menusRes, tablesRes] = await Promise.all([
          orderAPI.getAll(),
          menuAPI.getAll(),
          tableAPI.getAll(),
        ]);

        const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
        const todayOrders = ordersRes.data.filter((o) => {
          const timestamp = o.created_at || o.createdAt;
          if (!timestamp) return false;
          const d = new Date(timestamp).toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
          return d === todayStr;
        });

        const todayRevenue = todayOrders
          .filter((o) => ['paid', 'processing', 'completed'].includes(o.status))
          .reduce((s, o) => s + parseFloat(o.total_amount), 0);

        setStats({
          orders: todayOrders.length,
          menus: menusRes.data.length,
          tables: tablesRes.data.length,
          revenue: todayRevenue,
        });
        setRecentOrders(ordersRes.data.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();

    const SOCKET_URL = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace('/api', '') 
      : `http://${window.location.hostname}:5000`;
    const socket = io(SOCKET_URL);

    socket.on('new_order', () => fetchStats());
    socket.on('order_updated', () => fetchStats());

    return () => socket.disconnect();
  }, []);

  if (loading) {
    return (
      <div className="loading-page" style={{ minHeight: 'auto', padding: '60px' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Selamat datang di Ponbean Management System</p>
      </div>

      <div className="grid grid-4" style={{ marginBottom: '32px' }}>
        {[
          { icon: <MdReceipt />, label: 'Pesanan Hari Ini', value: stats.orders, bg: 'var(--info-bg)', color: 'var(--info)' },
          { icon: <MdTrendingUp />, label: 'Pendapatan Hari Ini', value: formatRupiah(stats.revenue), bg: 'var(--success-bg)', color: 'var(--success)' },
          { icon: <MdRestaurantMenu />, label: 'Total Menu', value: stats.menus, bg: 'var(--warning-bg)', color: 'var(--warning)' },
          { icon: <MdTableBar />, label: 'Total Meja', value: stats.tables, bg: 'var(--primary-glow)', color: 'var(--primary)' },
        ].map((stat, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: stat.bg, color: stat.color }}>
              {stat.icon}
            </div>
            <div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Pesanan Terakhir</h2>
        {recentOrders.length === 0 ? (
          <p className="text-muted">Belum ada pesanan.</p>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>No. Order</th>
                  <th>Meja</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => {
                  const st = {
                    pending_payment: { l: 'Menunggu', c: 'badge-warning' },
                    paid: { l: 'Dibayar', c: 'badge-info' },
                    processing: { l: 'Diproses', c: 'badge-primary' },
                    completed: { l: 'Selesai', c: 'badge-success' },
                    cancelled: { l: 'Batal', c: 'badge-danger' },
                  }[o.status] || { l: o.status, c: 'badge-info' };

                  return (
                    <tr key={o.id}>
                      <td style={{ fontWeight: 600 }}>{o.order_number}</td>
                      <td>Meja {o.table?.nomor_meja}</td>
                      <td>{formatRupiah(o.total_amount)}</td>
                      <td><span className={`badge ${st.c}`}>{st.l}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
