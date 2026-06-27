import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import CircularTimer from '../components/CircularTimer';
import DynamicQR from '../components/DynamicQR';
import './Dashboard.css';

const API = '/api';

// تحية حسب الوقت
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'صباح الخير';
  if (h < 18) return 'مساء الخير';
  return 'مساء النور';
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [inbodyHistory, setInbodyHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [freezeLoading, setFreezeLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [msg, setMsg] = useState(null);

  const token = localStorage.getItem('gym_token');

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    const fetchData = async () => {
      try {
        const [meRes, refRes, inbodyRes] = await Promise.all([
          axios.get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API}/user/referrals`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API}/user/inbody`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setUser(meRes.data.user);
        setReferrals(refRes.data.referrals || []);
        setInbodyHistory(inbodyRes.data.records || []);
      } catch {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, navigate]);

  const getRemainingDays = () => {
    if (!user?.subscription_end) return 0;
    const diff = new Date(user.subscription_end) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const getTotalDays = () => {
    if (!user?.subscription_start || !user?.subscription_end) return 30;
    const diff = new Date(user.subscription_end) - new Date(user.subscription_start);
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const handleFreeze = async () => {
    setFreezeLoading(true);
    try {
      const action = user.is_frozen ? 'unfreeze' : 'freeze';
      const res = await axios.post(
        `${API}/user/${action}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMsg({ type: 'success', text: res.data.message });
      const meRes = await axios.get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
      setUser(meRes.data.user);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'حدث خطأ، حاول مرة أخرى.' });
    } finally {
      setFreezeLoading(false);
      setTimeout(() => setMsg(null), 4000);
    }
  };

  const copyReferralLink = () => {
    const link = `${window.location.origin}/register?ref=${user?.referral_code}`;
    navigator.clipboard.writeText(link);
    setMsg({ type: 'success', text: '✅ تم نسخ رابط الدعوة!' });
    setTimeout(() => setMsg(null), 2500);
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner" />
        <p>جاري تحميل لوحة التحكم...</p>
      </div>
    );
  }

  const remaining = getRemainingDays();
  const total = getTotalDays();
  const activeRefs = referrals.filter(r => r.status === 'active').length;
  const registeredRefs = referrals.filter(r => r.status === 'registered').length;

  const statusLabel = {
    active: '🟢 نشط',
    frozen: '❄️ مجمد',
    expired: '🔴 منتهي',
    inactive: '⚪ غير مفعل',
  };

  return (
    <div className="dashboard" dir="rtl">
      {/* Toast */}
      <AnimatePresence>
        {msg && (
          <motion.div
            className={`toast toast-${msg.type}`}
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
          >
            {msg.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="dashboard-header">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="dash-greeting">{getGreeting()} 💪</p>
          <h1 className="dash-name">{user?.full_name}</h1>
          <span className="dash-gym-id">🪪 رقم العضوية: {user?.gym_id}</span>
        </motion.div>

        <motion.div
          className={`dash-status-badge status-${user?.status}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          {statusLabel[user?.status] || user?.status}
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="dash-tabs">
        {[
          { id: 'overview',  label: '📊 نظرة عامة' },
          { id: 'entry-qr',  label: '🔐 كود الدخول' },
          { id: 'referrals', label: `👥 الدعوات (${activeRefs})` },
          { id: 'inbody',    label: '⚖️ قياسات الجسم' },
        ].map(tab => (
          <button
            key={tab.id}
            className={`dash-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">

        {/* === نظرة عامة === */}
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            className="dash-grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* بطاقة الاشتراك */}
            <div className="dash-card dash-card-subscription">
              <h3>📅 الاشتراك</h3>
              <div style={{ display: 'flex', justifyContent: 'center', margin: '1.5rem 0' }}>
                <CircularTimer totalDays={total} remainingDays={remaining} />
              </div>
              {user?.subscription_end ? (
                <div className="sub-dates">
                  <div>
                    <span className="date-label">تاريخ البداية</span>
                    <span className="date-val">{new Date(user.subscription_start).toLocaleDateString('ar-EG')}</span>
                  </div>
                  <div>
                    <span className="date-label">تاريخ الانتهاء</span>
                    <span className="date-val">{new Date(user.subscription_end).toLocaleDateString('ar-EG')}</span>
                  </div>
                </div>
              ) : (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '1rem' }}>
                  لا يوجد اشتراك نشط حالياً. تفضل للاستقبال لتفعيل اشتراكك.
                </p>
              )}
            </div>



            {/* بطاقة الإحصاءات */}
            <div className="dash-card dash-card-stats">
              <h3>📈 إحصاءاتي</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-num neon-text">{activeRefs}</span>
                  <span className="stat-lbl">دعوات مفعّلة</span>
                </div>
                <div className="stat-item">
                  <span className="stat-num" style={{ color: '#888' }}>{registeredRefs}</span>
                  <span className="stat-lbl">دعوات معلقة</span>
                </div>
                <div className="stat-item">
                  <span className="stat-num neon-text">{remaining}</span>
                  <span className="stat-lbl">أيام متبقية</span>
                </div>
                <div className="stat-item">
                  <span className="stat-num">{user?.gender === 'male' ? '👨' : '👩'}</span>
                  <span className="stat-lbl">{user?.gender === 'male' ? 'رجال' : 'سيدات'}</span>
                </div>
              </div>
              <div className="referral-link-box">
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  كود الدعوة الخاص بك: <strong style={{ color: 'var(--accent)' }}>{user?.referral_code}</strong>
                </p>
                <button className="btn-primary" onClick={copyReferralLink} style={{ width: '100%', padding: '10px' }}>
                  📋 نسخ رابط الدعوة
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* === كود الدخول === */}
        {activeTab === 'entry-qr' && (
          <motion.div
            key="entry-qr"
            className="dash-qr-tab"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>🔐 كود الدخول الخاص بك</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                أرِ هذا الكود للموظف عند الدخول. يتجدد كل 60 ثانية تلقائياً.
              </p>
            </div>
            <DynamicQR />
          </motion.div>
        )}

        {/* === الدعوات === */}
        {activeTab === 'referrals' && (
          <motion.div
            key="referrals"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="dash-card">
              <h3 style={{ marginBottom: '1.5rem' }}>👥 الأشخاص اللي دعوتهم</h3>
              {referrals.length === 0 ? (
                <div className="empty-state">
                  <span style={{ fontSize: '3rem' }}>🤝</span>
                  <p>لم تقم بدعوة أحد بعد. شارك الرابط واكسب مكافآت!</p>
                  <button className="btn-primary" onClick={copyReferralLink} style={{ marginTop: '1rem' }}>
                    📋 نسخ رابط الدعوة
                  </button>
                </div>
              ) : (
                <>
                  <div className="referral-stats-bar">
                    <div className="ref-stat-item">
                      <span className="ref-stat-num" style={{ color: 'var(--accent)' }}>{activeRefs}</span>
                      <span className="ref-stat-lbl">✅ مفعّل</span>
                    </div>
                    <div className="ref-stat-item">
                      <span className="ref-stat-num" style={{ color: '#888' }}>{registeredRefs}</span>
                      <span className="ref-stat-lbl">⏳ في انتظار التفعيل</span>
                    </div>
                  </div>
                  <table className="referrals-table">
                    <thead>
                      <tr>
                        <th>الاسم</th>
                        <th>رقم العضوية</th>
                        <th>تاريخ التسجيل</th>
                        <th>الحالة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {referrals.map(r => (
                        <tr key={r.id}>
                          <td>{r.referee?.full_name || '—'}</td>
                          <td>{r.referee?.gym_id || '—'}</td>
                          <td>{r.referee?.created_at ? new Date(r.referee.created_at).toLocaleDateString('ar-EG') : '—'}</td>
                          <td>
                            <span className={`ref-badge ref-${r.status}`}>
                              {r.status === 'active' ? '✅ مفعّل' : '⏳ في انتظار التفعيل'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* === قياسات الجسم === */}
        {activeTab === 'inbody' && (
          <motion.div
            key="inbody"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="dash-card">
              <h3 style={{ marginBottom: '0.5rem' }}>⚖️ تقدمي في قياسات الجسم (InBody)</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                تُضاف القياسات عن طريق الاستقبال. راجع الاستقبال لإجراء قياسك الأول.
              </p>
              {inbodyHistory.length === 0 ? (
                <div className="empty-state">
                  <span style={{ fontSize: '3rem' }}>📉</span>
                  <p>لا توجد قياسات حتى الآن. تواصل مع الاستقبال لإجراء قياس InBody.</p>
                </div>
              ) : (
                <div className="inbody-grid">
                  {inbodyHistory.map((record) => (
                    <div key={record.id} className="inbody-card">
                      <div className="inbody-card-header">
                        <strong>📅 تاريخ القياس</strong>
                        <span style={{ color: 'var(--accent)' }}>{new Date(record.test_date).toLocaleDateString('ar-EG')}</span>
                      </div>
                      <div className="inbody-row"><span>⚖️ الوزن</span><strong>{record.weight} كجم</strong></div>
                      <div className="inbody-row"><span>💪 كتلة العضلات</span><strong>{record.skeletal_muscle_mass} كجم</strong></div>
                      <div className="inbody-row"><span>🔥 نسبة الدهون</span><strong>{record.body_fat_percentage}%</strong></div>
                      <div className="inbody-row"><span>💧 نسبة الماء</span><strong>{record.water_percentage}%</strong></div>
                      <div className="inbody-row"><span>📊 مؤشر كتلة الجسم</span><strong>{record.bmi}</strong></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
