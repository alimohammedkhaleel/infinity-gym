import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ScanQR = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const processQR = async () => {
      try {
        const qParam = searchParams.get('q');
        if (!qParam) {
          throw new Error('لم يتم العثور على بيانات في الرابط');
        }

        let normalizedB64 = decodeURIComponent(qParam).trim()
          .replace(/-/g, '+')
          .replace(/_/g, '/');
        
        while (normalizedB64.length % 4 !== 0) {
          normalizedB64 += '=';
        }

        // Decode Base64 string
        const jsonString = atob(normalizedB64);
        
        // Ensure token exists to authenticate the request
        const token = localStorage.getItem('gym_token');
        if (!token) {
          throw new Error('يجب تسجيل الدخول كمسؤول أولاً لمسح الأكواد');
        }

        // Hit the verify endpoint
        const res = await axios.post(
          '/api/user/verify-qr',
          { qr_data: jsonString },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        setResult(res.data.user);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || err.message || 'فشل التحقق من الكود');
      } finally {
        setLoading(false);
      }
    };

    processQR();
  }, [searchParams]);

  return (
    <div className="content-section" style={{ padding: '15vh 5vw', minHeight: '100vh', textAlign: 'center' }} dir="rtl">
      <h2 className="section-title">نتيجة مسح <span className="highlight-green">الكود</span></h2>
      
      {loading && (
        <div style={{ marginTop: '2rem' }}>
          <div className="qr-spinner" style={{ margin: '0 auto', width: '40px', height: '40px', border: '4px solid #333', borderTop: '4px solid #39ff14', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '1rem', color: '#aaa' }}>جاري التحقق من الكود...</p>
        </div>
      )}

      {error && (
        <div style={{ marginTop: '2rem', padding: '2rem', backgroundColor: 'rgba(255, 50, 50, 0.1)', border: '1px solid #ff3232', borderRadius: '12px' }}>
          <h3 style={{ color: '#ff3232', marginBottom: '1rem' }}>❌ خطأ</h3>
          <p style={{ color: '#eee' }}>{error}</p>
          <button className="btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => navigate('/')}>العودة للرئيسية</button>
        </div>
      )}

      {result && (
        <div style={{ marginTop: '2rem', padding: '2rem', backgroundColor: 'rgba(57, 255, 20, 0.05)', border: '1px solid rgba(57, 255, 20, 0.3)', borderRadius: '12px', display: 'inline-block', textAlign: 'right', minWidth: '300px' }}>
          <h3 style={{ color: '#39ff14', marginBottom: '1.5rem', textAlign: 'center' }}>✅ تم التحقق بنجاح</h3>
          <p style={{ marginBottom: '10px' }}><strong style={{ color: '#fff' }}>الاسم:</strong> {result.full_name}</p>
          <p style={{ marginBottom: '10px' }}><strong style={{ color: '#fff' }}>Gym ID:</strong> {result.gym_id}</p>
          <p style={{ marginBottom: '10px' }}>
            <strong style={{ color: '#fff' }}>الحالة:</strong>{' '}
            <span style={{ color: result.status === 'active' ? '#39ff14' : '#ff3232', fontWeight: 'bold' }}>
              {result.status === 'active' ? 'نشط' : result.status}
            </span>
          </p>
          <p style={{ marginBottom: '10px' }}><strong style={{ color: '#fff' }}>بداية الاشتراك:</strong> {new Date(result.subscription_start).toLocaleDateString('ar-EG')}</p>
          <p style={{ marginBottom: '10px' }}><strong style={{ color: '#fff' }}>نهاية الاشتراك:</strong> {new Date(result.subscription_end).toLocaleDateString('ar-EG')}</p>
          {result.is_frozen && <p style={{ color: '#00d0ff', fontWeight: 'bold', marginTop: '10px' }}>❄️ الحساب مجمد حالياً</p>}
          
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <button className="btn-primary" onClick={() => navigate('/admin')}>لوحة الإدارة</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScanQR;
