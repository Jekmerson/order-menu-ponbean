import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Layouts
import AdminLayout from './components/AdminLayout';
import KasirLayout from './components/KasirLayout';

// Pages
import Login from './pages/Login';
import MenuPage from './pages/customer/MenuPage';
import OrderStatusPage from './pages/customer/OrderStatusPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import MenuManagement from './pages/admin/MenuManagement';
import TableManagement from './pages/admin/TableManagement';
import LaporanPenjualan from './pages/admin/LaporanPenjualan';
import UserManagement from './pages/admin/UserManagement';
import KasirDashboard from './pages/kasir/KasirDashboard';
import KasirHistory from './pages/kasir/KasirHistory';

import './index.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* Public - Customer */}
            <Route path="/menu/:tableId" element={<MenuPage />} />
            <Route path="/order/:orderNumber" element={<OrderStatusPage />} />

            {/* Auth */}
            <Route path="/login" element={<Login />} />

            {/* Admin */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="menus" element={<MenuManagement />} />
              <Route path="tables" element={<TableManagement />} />
              <Route path="orders" element={<KasirDashboard />} />
              <Route path="reports" element={<LaporanPenjualan />} />
              <Route path="users" element={<UserManagement />} />
            </Route>

            {/* Kasir */}
            <Route path="/kasir" element={<KasirLayout />}>
              <Route index element={<KasirDashboard />} />
              <Route path="history" element={<KasirHistory />} />
            </Route>

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>

        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#1F2937',
              color: '#F9FAFB',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px',
            },
          }}
        />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
