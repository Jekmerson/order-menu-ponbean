import { useState, useEffect } from 'react';
import { menuAPI, UPLOADS_URL } from '../../services/api';
import { formatRupiah } from '../../utils/helpers';
import { MdAdd, MdEdit, MdDelete, MdToggleOn, MdToggleOff } from 'react-icons/md';
import toast from 'react-hot-toast';

const MenuManagement = () => {
  const [menus, setMenus] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ nama: '', category_id: '', deskripsi: '', harga: '', is_available: true });
  const [imageFile, setImageFile] = useState(null);

  const fetchData = async () => {
    try {
      const [menuRes, catRes] = await Promise.all([menuAPI.getAll(), menuAPI.getCategories()]);
      setMenus(menuRes.data);
      setCategories(catRes.data);
    } catch (err) {
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openModal = (item = null) => {
    if (item) {
      setEditItem(item);
      setForm({
        nama: item.nama,
        category_id: item.category_id,
        deskripsi: item.deskripsi || '',
        harga: item.harga,
        is_available: item.is_available,
      });
    } else {
      setEditItem(null);
      setForm({ nama: '', category_id: categories[0]?.id || '', deskripsi: '', harga: '', is_available: true });
    }
    setImageFile(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    if (imageFile) formData.append('gambar', imageFile);

    try {
      if (editItem) {
        await menuAPI.update(editItem.id, formData);
        toast.success('Menu berhasil diperbarui');
      } else {
        await menuAPI.create(formData);
        toast.success('Menu berhasil ditambahkan');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan menu');
    }
  };

  const handleDelete = async (id, nama) => {
    if (!confirm(`Hapus menu "${nama}"?`)) return;
    try {
      await menuAPI.delete(id);
      toast.success('Menu berhasil dihapus');
      fetchData();
    } catch (err) {
      toast.error('Gagal menghapus menu');
    }
  };

  const handleToggle = async (id) => {
    try {
      await menuAPI.toggleAvailability(id);
      fetchData();
    } catch (err) {
      toast.error('Gagal mengubah status');
    }
  };

  if (loading) {
    return <div className="loading-page" style={{ minHeight: 'auto', padding: '60px' }}><div className="spinner" /></div>;
  }

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">Kelola Menu</h1>
          <p className="page-subtitle">{menus.length} menu tersedia</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <MdAdd /> Tambah Menu
        </button>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Gambar</th>
              <th>Nama Menu</th>
              <th>Kategori</th>
              <th>Harga</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {menus.map((menu) => (
              <tr key={menu.id}>
                <td>
                  <div style={{
                    width: 48, height: 48, borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-elevated)',
                    backgroundImage: menu.gambar ? `url(${UPLOADS_URL}/${menu.gambar})` : 'none',
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
                  }}>
                    {!menu.gambar && '🍽️'}
                  </div>
                </td>
                <td>
                  <div style={{ fontWeight: 600 }}>{menu.nama}</div>
                  <div className="text-xs text-muted">{menu.deskripsi?.slice(0, 40)}{menu.deskripsi?.length > 40 ? '...' : ''}</div>
                </td>
                <td>{menu.category?.icon} {menu.category?.nama}</td>
                <td style={{ fontWeight: 600 }}>{formatRupiah(menu.harga)}</td>
                <td>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleToggle(menu.id)} style={{ color: menu.is_available ? 'var(--success)' : 'var(--text-muted)' }}>
                    {menu.is_available ? <><MdToggleOn size={20} /> Tersedia</> : <><MdToggleOff size={20} /> Habis</>}
                  </button>
                </td>
                <td>
                  <div className="flex gap-sm">
                    <button className="btn btn-ghost btn-icon sm" onClick={() => openModal(menu)}><MdEdit /></button>
                    <button className="btn btn-ghost btn-icon sm" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(menu.id, menu.nama)}><MdDelete /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editItem ? 'Edit Menu' : 'Tambah Menu'}</h2>
              <button className="btn btn-ghost btn-icon sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Nama Menu</label>
                <input className="form-input" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Kategori</label>
                <select className="form-select" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} required>
                  <option value="">Pilih Kategori</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.nama}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Harga (Rp)</label>
                <input className="form-input" type="number" value={form.harga} onChange={(e) => setForm({ ...form, harga: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Deskripsi</label>
                <textarea className="form-textarea" value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} rows={2} />
              </div>
              <div className="form-group">
                <label className="form-label">Gambar</label>
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="form-input" />
              </div>
              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                {editItem ? 'Simpan Perubahan' : 'Tambah Menu'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;
