import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import './Login.css'; // Reuse same styles

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get('ref') || '';

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    gender: 'male',
    referral_code: refCode
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('كلمتا المرور غير متطابقتين.');
      return;
    }
    if (formData.password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل.');
      return;
    }

    setLoading(true);

    try {
      // Get device fingerprint for anti-fraud
      const device_fingerprint = navigator.userAgent + '_' + screen.width + '_' + screen.height;

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          gender: formData.gender,
          referral_code: formData.referral_code || undefined,
          device_fingerprint
        })
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'فشل التسجيل');

      // Save token
      localStorage.setItem('gym_token', data.token);
      setSuccess(data.message);

      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
          <h2 className="auth-title" style={{ color: 'var(--accent)' }}>تم التسجيل!</h2>
          <p style={{ color: '#ccc', marginBottom: '1rem' }}>{success}</p>
          <p style={{ color: '#888', fontSize: '0.9rem' }}>جاري تحويلك للـ Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '520px' }}>
        <h2 className="auth-title">
          إنشاء <span className="highlight-green">حساب جديد</span>
        </h2>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form" dir="rtl">
          <div className="form-group">
            <label>الاسم الكامل</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={e => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="مثال: أحمد محمد علي"
              required
            />
          </div>

          <div className="form-group">
            <label>البريد الإلكتروني</label>
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              placeholder="example@email.com"
              required
              dir="ltr"
            />
          </div>

          <div className="form-group">
            <label>رقم الهاتف</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              placeholder="01xxxxxxxxx"
              required
              dir="ltr"
            />
          </div>

          <div className="form-group">
            <label>النوع</label>
            <select
              value={formData.gender}
              onChange={e => setFormData({ ...formData, gender: e.target.value })}
            >
              <option value="male">👨 ذكر</option>
              <option value="female">👩 أنثى</option>
            </select>
          </div>

          <div className="form-group">
            <label>كلمة المرور</label>
            <input
              type="password"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              placeholder="6 أحرف على الأقل"
              required
            />
          </div>

          <div className="form-group">
            <label>تأكيد كلمة المرور</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="أعد كتابة كلمة المرور"
              required
            />
          </div>

          {formData.referral_code && (
            <div className="form-group">
              <label>كود الدعوة</label>
              <input
                type="text"
                value={formData.referral_code}
                onChange={e => setFormData({ ...formData, referral_code: e.target.value })}
                placeholder="INF-XXXXXX (اختياري)"
                dir="ltr"
              />
            </div>
          )}

          {!formData.referral_code && (
            <div className="form-group">
              <label>
                كود الدعوة{' '}
                <span style={{ color: '#888', fontSize: '0.8rem' }}>(اختياري)</span>
              </label>
              <input
                type="text"
                value={formData.referral_code}
                onChange={e => setFormData({ ...formData, referral_code: e.target.value })}
                placeholder="INF-XXXXXX"
                dir="ltr"
              />
            </div>
          )}

          <div
            className="auth-notice"
            style={{
              background: 'rgba(57,255,20,0.05)',
              border: '1px solid rgba(57,255,20,0.2)',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '0.85rem',
              color: '#aaa',
              textAlign: 'center'
            }}
          >
            💡 بعد التسجيل، يجب زيارة الاستقبال لتفعيل الاشتراك.
          </div>

          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading ? '⏳ جاري التسجيل...' : '🚀 إنشاء الحساب'}
          </button>
        </form>

        <p className="auth-toggle">
          لديك حساب بالفعل؟{' '}
          <Link to="/login" className="highlight-green" style={{ fontWeight: 'bold' }}>
            سجل دخول
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
