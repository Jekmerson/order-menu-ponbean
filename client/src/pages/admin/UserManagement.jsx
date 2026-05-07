import { useState, useEffect } from 'react';
import { authAPI } from '../../services/api';
import { MdAdd, MdDelete, MdPerson } from 'react-icons/md';
import toast from 'react-hot-toast';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ nama: '', username: '', password: '', role: 'kasir' });

  const fetchUsers = async () => {
    try {
      const res = await authAPI.getUsers();
      setUsers(res.data);
    } catch (err) {
      toast.error('Gagal memuat data user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await authAPI.createUser(form);
      toast.success('User berhasil dibuat');
      setShowModal(false);
      setForm({ nama: '', username: '', password: '', role: 'kasir' });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membuat user');
    }
  };

  const handleDelete = async (id, nama) => {
    if (!confirm(`Hapus user "${nama}"?`)) return;
    try {
      await authAPI.deleteUser(id);
      toast.success('User berhasil dihapus');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus user');
    }
  };

  if (loading) {
    return <div className="loading-page" style={{ minHeight: 'auto', padding: '60px' }}><div className="spinner" /></div>;
  }

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">Kelola User</h1>
          <p className="page-subtitle">{users.length} user terdaftar</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><MdAdd /> Tambah User</button>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead><tr><th>Nama</th><th>Username</th><th>Role</th><th>Aksi</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="flex gap-sm" style={{ alignItems: 'center' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: u.role === 'admin' ? 'var(--primary-glow)' : 'var(--info-bg)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: u.role === 'admin' ? 'var(--primary)' : 'var(--info)',
                  }}>
                    <MdPerson />
                  </div>
                  <span style={{ fontWeight: 600 }}>{u.nama}</span>
                </td>
                <td>{u.username}</td>
                <td><span className={`badge ${u.role === 'admin' ? 'badge-primary' : 'badge-info'}`}>{u.role}</span></td>
                <td>
                  <button className="btn btn-ghost btn-icon sm" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(u.id, u.nama)}>
                    <MdDelete />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Tambah User</h2>
              <button className="btn btn-ghost btn-icon sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Nama Lengkap</label>
                <input className="form-input" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input className="form-input" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="kasir">Kasir</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>Tambah User</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
