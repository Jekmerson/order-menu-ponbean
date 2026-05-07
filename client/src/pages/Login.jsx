import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Username dan password harus diisi');
      return;
    }
    setIsLoading(true);
    try {
      const user = await login(username, password);
      toast.success(`Selamat datang, ${user.nama}!`);
      navigate(user.role === 'admin' ? '/admin' : '/kasir');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login gagal');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container animate-slide-up">
        <div className="login-brand">
          <div className="login-logo">☕</div>
          <h1 className="login-title">Ponbean</h1>
          <p className="login-subtitle">Cafe Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              id="login-username"
              type="text"
              className="form-input"
              placeholder="Masukkan username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={isLoading}
            style={{ width: '100%', marginTop: '8px' }}
          >
            {isLoading ? (
              <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
            ) : (
              'Masuk'
            )}
          </button>
        </form>

        <p className="login-footer">
          © 2026 Ponbean Coffee — All Rights Reserved
        </p>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: var(--bg-primary);
          background-image:
            radial-gradient(circle at 20% 50%, rgba(212, 165, 116, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(247, 201, 72, 0.06) 0%, transparent 50%);
        }
        .login-container {
          width: 100%;
          max-width: 400px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          padding: 40px 32px;
        }
        .login-brand {
          text-align: center;
          margin-bottom: 32px;
        }
        .login-logo {
          font-size: 3rem;
          margin-bottom: 12px;
        }
        .login-title {
          font-size: 2rem;
          font-weight: 900;
          background: linear-gradient(135deg, var(--primary), var(--accent));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .login-subtitle {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin-top: 4px;
        }
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .login-footer {
          text-align: center;
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 24px;
        }
      `}</style>
    </div>
  );
};

export default Login;
