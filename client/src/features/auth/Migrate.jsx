import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import './Migrate.css';

const Migrate = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    gender: 'male',
    subscription_end: '',
    password: '',
    confirmPassword: ''
  });
  const [showPass, setShowPass] = useState(false);
  const [status, setStatus] = useState({ loading: false, error: null, success: false, gymId: '' });

  // رابط مش موجود
  if (!token) {
    return (
      <div className="migrate-container">
        <div className="migrate-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⛔</div>
          <h2 style={{ color: 'var(--red)', marginBottom: '1rem' }}>رابط غير صالح</h2>
          <p style={{ color: '#888', marginBottom: '2rem', lineHeight: 1.7 }}>
            هذا الرابط غير صالح أو مفقود.<br />
            تواصل مع الاستقبال للحصول على رابط جديد.
          </p>
          <Link to="/" className="btn-outline" style={{ display: 'inline-block' }}>
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      setStatus({ loading: false, error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.', success: false, gymId: '' });
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setStatus({ loading: false, error: 'كلمتا المرور غير متطابقتين.', success: false, gymId: '' });
      return;
    }

    setStatus({ loading: true, error: null, success: false, gymId: '' });

    try {
      const response = await fetch('/api/auth/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          full_name: formData.full_name,
          phone: formData.phone,
          gender: formData.gender,
          subscription_end: formData.subscription_end,
          password: formData.password
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'حدث خطأ أثناء الإرسال');
      setStatus({ loading: false, error: null, success: true, gymId: data.gym_id || '' });
    } catch (err) {
      setStatus({ loading: false, error: err.message, success: false, gymId: '' });
    }
  };

  if (status.success) {
    return (
      <div className="migrate-container">
        <div className="migrate-card success">
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎉</div>
          <h2 style={{ color: 'var(--accent)', marginBottom: '1rem' }}>تم التسجيل بنجاح!</h2>
          {status.gymId && (
            <div className="migrate-gymid-box">
              <span>رقم عضويتك</span>
              <strong>{status.gymId}</strong>
            </div>
          )}
          <p style={{ color: '#aaa', margin: '1rem 0', lineHeight: 1.7 }}>
            ✅ تم استلام بياناتك. سيقوم الاستقبال بمراجعتها وتفعيل حسابك.
          </p>
          <p style={{ color: '#555', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            💡 بعد التفعيل ستتلقى إشعاراً على واتساب بكلمة المرور المؤقتة.
          </p>
          <Link to="/login" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
            تسجيل الدخول
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="migrate-container">
      <div className="migrate-card">
        <h2 className="section-title" style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
          تسجيل بيانات <span className="highlight-green">المشتركين</span>
        </h2>
        <p className="migrate-subtitle">
          أدخل بياناتك واختر كلمة مرور — ستُستخدم لتسجيل الدخول لاحقاً.
        </p>

        {/* info banner */}
        <div className="migrate-info-banner">
          <span>🔗</span>
          <p>
            يمكن استخدام هذا الرابط لتسجيل <strong>أكثر من مشترك</strong>.
            أرسله لكل المشتركين القدامى.
          </p>
        </div>

        {status.error && <div className="migrate-error">{status.error}</div>}

        <form onSubmit={handleSubmit} className="migrate-form" dir="rtl">

          <div className="form-group">
            <label>الاسم الثلاثي</label>
            <input
              type="text"
              required
              value={formData.full_name}
              onChange={e => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="مثال: أحمد محمد علي"
            />
          </div>

          <div className="form-group">
            <label>رقم الهاتف (الواتساب)</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              placeholder="01xxxxxxxxx"
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
            <label>تاريخ انتهاء اشتراكك الحالي</label>
            <input
              type="date"
              required
              value={formData.subscription_end}
              onChange={e => setFormData({ ...formData, subscription_end: e.target.value })}
            />
          </div>

          {/* ── كلمة المرور ── */}
          <div className="migrate-divider">
            <span>اختر كلمة مرور للدخول</span>
          </div>

          <div className="form-group">
            <label>كلمة المرور</label>
            <div className="password-input-wrapper">
              <input
                type={showPass ? 'text' : 'password'}
                required
                minLength={6}
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                placeholder="6 أحرف على الأقل"
              />
              <button
                type="button"
                className="toggle-pass-btn"
                onClick={() => setShowPass(v => !v)}
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>تأكيد كلمة المرور</label>
            <div className="password-input-wrapper">
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={formData.confirmPassword}
                onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="أعد كتابة كلمة المرور"
              />
              {formData.confirmPassword && (
                <span className="pass-match-indicator">
                  {formData.password === formData.confirmPassword ? '✅' : '❌'}
                </span>
              )}
            </div>
          </div>

          <div className="migrate-notice">
            💡 بعد إرسال البيانات، ستنتظر موافقة الاستقبال ثم تدخل بـ
            {' '}<strong>Gym ID</strong> + كلمة المرور التي اخترتها.
          </div>

          <button type="submit" className="btn-primary migrate-submit" disabled={status.loading}>
            {status.loading ? '⏳ جاري الإرسال...' : '🚀 إرسال البيانات'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: '#555' }}>
          لديك حساب بالفعل؟{' '}
          <Link to="/login" className="highlight-green" style={{ fontWeight: 'bold' }}>
            سجل دخول
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Migrate;
