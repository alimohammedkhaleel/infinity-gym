import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({ gym_id: '', email: '', password: '' });
  const [useEmail, setUseEmail] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const body = {
        password: formData.password,
        ...(useEmail ? { email: formData.email } : { gym_id: formData.gym_id })
      };

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'فشل تسجيل الدخول');

      localStorage.setItem('gym_token', data.token);

      if (data.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <span className="auth-logo-icon">🏋️</span>
          <span className="auth-logo-name">Infinity Gym</span>
        </div>

        <h2 className="auth-title">
          تسجيل <span className="highlight-green">الدخول</span>
        </h2>
        <p className="auth-subtitle">أهلاً بعودتك! سجّل دخولك للوصول إلى حسابك</p>

        {error && <div className="auth-error">{error}</div>}

        {/* Toggle between Gym ID and Email */}
        <div className="auth-method-toggle">
          <button
            type="button"
            className={`method-btn ${!useEmail ? 'active' : ''}`}
            onClick={() => setUseEmail(false)}
          >
            🪪 رقم العضوية
          </button>
          <button
            type="button"
            className={`method-btn ${useEmail ? 'active' : ''}`}
            onClick={() => setUseEmail(true)}
          >
            📧 البريد الإلكتروني
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" dir="rtl">
          {useEmail ? (
            <div className="form-group">
              <label htmlFor="login-email">البريد الإلكتروني</label>
              <input
                id="login-email"
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                required
                dir="ltr"
                autoComplete="email"
              />
            </div>
          ) : (
            <div className="form-group">
              <label htmlFor="login-gymid">رقم العضوية (Gym ID)</label>
              <input
                id="login-gymid"
                type="text"
                value={formData.gym_id}
                onChange={e => setFormData({ ...formData, gym_id: e.target.value.toUpperCase() })}
                required
                dir="ltr"
                autoComplete="username"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="login-password">كلمة المرور</label>
            <input
              id="login-password"
              type="password"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? '⏳ جاري الدخول...' : '💪 دخول'}
          </button>
        </form>

        <p className="auth-toggle">
          ليس لديك حساب؟{' '}
          <Link to="/register">سجل الآن</Link>
        </p>
        <p className="auth-toggle" style={{ marginTop: '0.5rem', fontSize: '0.82rem' }}>
          مشترك قديم؟{' '}
          <span onClick={() => navigate('/migrate')}>نقل بياناتك هنا</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
