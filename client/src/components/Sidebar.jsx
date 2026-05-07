import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  MdDashboard,
  MdRestaurantMenu,
  MdTableBar,
  MdReceipt,
  MdBarChart,
  MdPeople,
  MdLogout,
} from 'react-icons/md';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminLinks = [
    { to: '/admin', icon: <MdDashboard />, label: 'Dashboard', end: true },
    { to: '/admin/menus', icon: <MdRestaurantMenu />, label: 'Kelola Menu' },
    { to: '/admin/tables', icon: <MdTableBar />, label: 'Kelola Meja' },
    { to: '/admin/orders', icon: <MdReceipt />, label: 'Pesanan' },
    { to: '/admin/reports', icon: <MdBarChart />, label: 'Laporan' },
    { to: '/admin/users', icon: <MdPeople />, label: 'Kelola User' },
  ];

  const kasirLinks = [
    { to: '/kasir', icon: <MdReceipt />, label: 'Pesanan Masuk', end: true },
    { to: '/kasir/history', icon: <MdBarChart />, label: 'Riwayat' },
  ];

  const links = user?.role === 'admin' ? adminLinks : kasirLinks;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-logo">P</div>
        <span className="sidebar-brand-name">Ponbean</span>
      </div>

      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <span className="icon">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div style={{ padding: '8px 14px', marginBottom: '8px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user?.nama}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
            {user?.role}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="sidebar-link"
          style={{ width: '100%', color: 'var(--danger)' }}
        >
          <span className="icon"><MdLogout /></span>
          Keluar
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
