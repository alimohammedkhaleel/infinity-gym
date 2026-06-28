import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

// ─── QR Scanner Tab ────────────────────────────────────────────────────────────
const QRScannerTab = ({ showMsg }) => {
  const scannerRef  = useRef(null);
  const instanceRef = useRef(null);
  const [scanning,  setScanning]  = useState(false);
  const [member,    setMember]    = useState(null);
  const [daysLeft,  setDaysLeft]  = useState(null);
  const [error,     setError]     = useState(null);
  const [loading,   setLoading]   = useState(false);
  const debounceRef = useRef(false);

  // ── call backend to verify decoded QR data ───────────────────────────────
  const verify = useCallback(async (rawJson) => {
    if (debounceRef.current) return;
    debounceRef.current = true;
    setLoading(true);
    setError(null);
    setMember(null);

    try {
      const token = localStorage.getItem('gym_token');
      const res   = await fetch('/api/user/verify-qr', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body   : JSON.stringify({ qr_data: rawJson }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) throw new Error(data.message || 'فشل التحقق');

      setMember(data.member);
      setDaysLeft(data.days_left);
      showMsg?.(`✅ تم التحقق: ${data.member.full_name}`, 'success');
    } catch (e) {
      setError(e.message);
      showMsg?.(e.message, 'error');
    } finally {
      setLoading(false);
      // allow re-scan after 4 s
      setTimeout(() => { debounceRef.current = false; }, 4000);
    }
  }, [showMsg]);

  // ── decode QR text — could be URL with ?q= param or raw JSON ─────────────
  const handleDecoded = useCallback((text) => {
    try {
      let rawJson = text.trim();

      // If it contains the query parameter 'q', parse it (supports absolute and relative URLs)
      if (rawJson.includes('q=')) {
        try {
          let urlObj;
          if (rawJson.startsWith('http://') || rawJson.startsWith('https://')) {
            urlObj = new URL(rawJson);
          } else {
            // Prepend dummy host to parse relative paths like "/scan?q=..." safely
            urlObj = new URL(rawJson, 'https://dummy.com');
          }

          const b64 = urlObj.searchParams.get('q');
          if (!b64) {
            throw new Error('الرابط لا يحتوي على معلمة البيانات (q)');
          }
          
          let normalizedB64 = decodeURIComponent(b64).trim()
            .replace(/-/g, '+')
            .replace(/_/g, '/');
          
          while (normalizedB64.length % 4 !== 0) {
            normalizedB64 += '=';
          }
          
          rawJson = atob(normalizedB64);
        } catch (e) {
          throw new Error('فشل قراءة رابط الـ QR: ' + e.message);
        }
      }

      // Validate it's proper JSON before sending
      let parsed;
      try {
        parsed = JSON.parse(rawJson);
      } catch (e) {
        throw new Error('محتوى الـ QR ليس بتنسيق JSON صالح');
      }

      if (!parsed.user_id || !parsed.gym_id || !parsed.token) {
        throw new Error('بيانات العضو ناقصة أو غير مكتملة في الـ QR');
      }

      verify(rawJson);
    } catch (e) {
      console.error('QR Decode error:', e);
      setError('⛔ ' + e.message);
    }
  }, [verify]);

  // ── start camera ─────────────────────────────────────────────────────────
  const startScanner = useCallback(async () => {
    if (!scannerRef.current) return;
    if (instanceRef.current) return;

    const html5qr = new Html5Qrcode('admin-qr-reader');
    instanceRef.current = html5qr;
    setScanning(true);
    setMember(null);
    setError(null);

    try {
      await html5qr.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 230, height: 230 } },
        handleDecoded,
        () => {} // ignore parse errors
      );
    } catch (e) {
      setError('⛔ تعذّر الوصول إلى الكاميرا: ' + e.message);
      setScanning(false);
      instanceRef.current = null;
    }
  }, [handleDecoded]);

  // ── stop camera ──────────────────────────────────────────────────────────
  const stopScanner = useCallback(async () => {
    if (!instanceRef.current) return;
    try {
      await instanceRef.current.stop();
      instanceRef.current.clear();
    } catch { /* ignore */ }
    instanceRef.current = null;
    setScanning(false);
  }, []);

  // cleanup on unmount
  useEffect(() => () => { stopScanner(); }, [stopScanner]);

  // ── Derived values ────────────────────────────────────────────────────────
  const statusColor = member
    ? member.status === 'active' ? '#39ff14' : '#ff3232'
    : '#aaa';

  const statusLabel = {
    active  : 'نشط ✅',
    expired : 'منتهي ❌',
    frozen  : 'مجمد ❄️',
    inactive: 'غير نشط ⛔',
  }[member?.status] ?? member?.status;

  const daysColor = daysLeft > 7 ? '#39ff14' : daysLeft > 3 ? '#ffd700' : '#ff3232';

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="qr-scanner-tab" dir="rtl">
      <h2 className="section-title" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
        ماسح كود <span className="highlight-green">الدخول</span>
      </h2>

      {/* Scanner viewport */}
      <div className="qr-scanner-viewport">
        <div id="admin-qr-reader" ref={scannerRef} style={{ width: '100%', maxWidth: 350, margin: '0 auto', borderRadius: 12, overflow: 'hidden' }} />

        {!scanning && (
          <div className="qr-scanner-placeholder" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 0' }}>
            <span style={{ fontSize: 64 }}>📷</span>
            <p style={{ color: '#aaa', marginTop: '1rem', textAlign: 'center', fontSize: '1.1rem' }}>اضغط لتشغيل الكاميرا ومسح كود العضو</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: '1.2rem' }}>
        {!scanning ? (
          <button className="btn-primary" style={{ padding: '10px 30px', fontSize: '1rem' }} onClick={startScanner}>
            📸 تشغيل الكاميرا
          </button>
        ) : (
          <button className="btn-outline" style={{ padding: '10px 30px', fontSize: '1rem' }} onClick={stopScanner}>
            ⏹️ إيقاف
          </button>
        )}
        {member && (
          <button
            className="btn-outline"
            style={{ padding: '10px 20px' }}
            onClick={() => { setMember(null); setDaysLeft(null); setError(null); }}
          >
            🔄 مسح جديد
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <p style={{ textAlign: 'center', color: '#aaa', marginTop: '1rem' }}>⏳ جاري التحقق...</p>
      )}

      {/* Error */}
      {error && !member && (
        <div className="qr-result-card qr-error-card" style={{ marginTop: '1.5rem' }}>
          <h3 style={{ color: '#ff3232' }}>{error}</h3>
          <p style={{ color: '#aaa', marginTop: 6 }}>اطلب من العضو فتح الكود من جديد وأعد المسح</p>
        </div>
      )}

      {/* Member card */}
      {member && (
        <div className="qr-result-card" style={{ marginTop: '1.5rem' }}>
          {/* Header stripe */}
          <div className="qr-result-header" style={{ backgroundColor: statusColor + '22', borderBottom: `2px solid ${statusColor}` }}>
            <div className="qr-avatar">
              {member.gender === 'female' ? '👩' : '👨'}
            </div>
            <div>
              <h3 style={{ color: '#fff', margin: 0 }}>{member.full_name}</h3>
              <p style={{ color: '#aaa', margin: 0, fontSize: '0.85rem' }}>{member.gym_id}</p>
            </div>
            <span className="qr-status-badge" style={{ background: statusColor + '33', color: statusColor, border: `1px solid ${statusColor}` }}>
              {statusLabel}
            </span>
          </div>

          {/* Details grid */}
          <div className="qr-detail-grid">
            <div className="qr-detail-item">
              <span className="qr-detail-label">الأيام المتبقية</span>
              <span className="qr-detail-val" style={{ color: daysColor, fontSize: '2rem', fontWeight: 800 }}>
                {daysLeft}
              </span>
              <span className="qr-detail-unit">يوم</span>
            </div>
            <div className="qr-detail-item">
              <span className="qr-detail-label">نهاية الاشتراك</span>
              <span className="qr-detail-val" style={{ fontSize: '1rem' }}>
                {member.subscription_end
                  ? new Date(member.subscription_end).toLocaleDateString('ar-EG')
                  : '—'}
              </span>
            </div>
            <div className="qr-detail-item">
              <span className="qr-detail-label">الجنس</span>
              <span className="qr-detail-val">{member.gender === 'female' ? 'سيدة' : 'رجل'}</span>
            </div>
            {member.is_frozen && (
              <div className="qr-detail-item" style={{ gridColumn: '1 / -1' }}>
                <span style={{ color: '#00d0ff', fontWeight: 700 }}>❄️ الحساب مجمد حالياً</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QRScannerTab;
