import { useState, useEffect } from 'react';
import { orderAPI } from '../../services/api';
import { formatRupiah, formatDateTime, getStatusBadge } from '../../utils/helpers';

const KasirHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await orderAPI.getAll({ status: 'completed' });
        setOrders(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return <div className="loading-page" style={{ minHeight: 'auto', padding: '60px' }}><div className="spinner" /></div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Riwayat Pesanan</h1>
        <p className="page-subtitle">{orders.length} pesanan selesai</p>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3 className="empty-state-title">Belum ada riwayat</h3>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>No. Order</th>
                <th>Meja</th>
                <th>Item</th>
                <th>Total</th>
                <th>Waktu</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const status = getStatusBadge(order.status);
                return (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 600 }}>{order.order_number}</td>
                    <td>Meja {order.table?.nomor_meja}</td>
                    <td className="text-sm">
                      {order.items?.map((i) => `${i.quantity}x ${i.menu?.nama}`).join(', ')}
                    </td>
                    <td style={{ fontWeight: 600 }}>{formatRupiah(order.total_amount)}</td>
                    <td className="text-sm">{formatDateTime(order.created_at)}</td>
                    <td><span className={`badge ${status.className}`}>{status.label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default KasirHistory;
