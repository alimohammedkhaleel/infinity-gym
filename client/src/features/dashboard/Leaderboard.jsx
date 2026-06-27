import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Leaderboard.css';

const medalEmoji = ['🥇', '🥈', '🥉'];
const medalColors = ['#ffd700', '#c0c0c0', '#cd7f32'];

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/admin/leaderboard');
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'فشل تحميل قائمة المتصدرين');
      setLeaders(data.leaderboard || []);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="leaderboard-page" dir="rtl">
      {/* Background glow effects */}
      <div className="lb-glow lb-glow-1" />
      <div className="lb-glow lb-glow-2" />

      <div className="leaderboard-container">
        {/* Header */}
        <motion.div
          className="lb-header"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <span className="lb-badge">🏆 قاعة الشرف</span>
          <h1 className="lb-title">
            أكثر <span className="highlight-green">المدعوين</span> نشاطاً
          </h1>
          <p className="lb-subtitle">
            ادعُ أصدقاءك إلى Infinity Gym واصعد في ترتيب المتصدرين لتحصل على مكافآت حصرية!
          </p>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              className="lb-loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="lb-spinner" />
              <p>جاري تحميل قائمة المتصدرين...</p>
            </motion.div>
          )}

          {error && (
            <motion.div
              key="error"
              className="lb-error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <span>⚠️</span>
              <p>{error}</p>
              <button className="btn-primary" onClick={fetchLeaderboard}>إعادة المحاولة</button>
            </motion.div>
          )}

          {!loading && !error && leaders.length === 0 && (
            <motion.div
              key="empty"
              className="lb-empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <span className="lb-empty-icon">🤝</span>
              <h3>لا توجد دعوات بعد!</h3>
              <p>كن أول من يدعو صديقاً ويحتل المركز الأول.</p>
            </motion.div>
          )}

          {!loading && !error && leaders.length > 0 && (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Top 3 Podium */}
              {leaders.length >= 3 && (
                <div className="lb-podium">
                  {/* المركز الثاني */}
                  <motion.div
                    className="podium-item podium-2"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="podium-avatar">{leaders[1]?.referrer?.gender === 'female' ? '👩' : '👨'}</div>
                    <div className="podium-medal">🥈</div>
                    <h3 className="podium-name">{leaders[1]?.referrer?.full_name || '—'}</h3>
                    <span className="podium-id">{leaders[1]?.referrer?.gym_id}</span>
                    <div className="podium-points" style={{ color: '#c0c0c0' }}>
                      {leaders[1]?.points || 0}
                      <small>نقطة</small>
                    </div>
                    <div className="podium-bar podium-bar-2" />
                  </motion.div>

                  {/* المركز الأول */}
                  <motion.div
                    className="podium-item podium-1"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="podium-crown">👑</div>
                    <div className="podium-avatar podium-avatar-1">{leaders[0]?.referrer?.gender === 'female' ? '👩' : '👨'}</div>
                    <div className="podium-medal">🥇</div>
                    <h3 className="podium-name">{leaders[0]?.referrer?.full_name || '—'}</h3>
                    <span className="podium-id">{leaders[0]?.referrer?.gym_id}</span>
                    <div className="podium-points" style={{ color: '#ffd700' }}>
                      {leaders[0]?.points || 0}
                      <small>نقطة</small>
                    </div>
                    <div className="podium-bar podium-bar-1" />
                  </motion.div>

                  {/* المركز الثالث */}
                  <motion.div
                    className="podium-item podium-3"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="podium-avatar">{leaders[2]?.referrer?.gender === 'female' ? '👩' : '👨'}</div>
                    <div className="podium-medal">🥉</div>
                    <h3 className="podium-name">{leaders[2]?.referrer?.full_name || '—'}</h3>
                    <span className="podium-id">{leaders[2]?.referrer?.gym_id}</span>
                    <div className="podium-points" style={{ color: '#cd7f32' }}>
                      {leaders[2]?.points || 0}
                      <small>نقطة</small>
                    </div>
                    <div className="podium-bar podium-bar-3" />
                  </motion.div>
                </div>
              )}

              {/* Full Ranked List */}
              <div className="lb-list">
                {leaders.map((leader, index) => (
                  <motion.div
                    key={leader.referrer_id || index}
                    className={`lb-row ${index < 3 ? `lb-row-top-${index + 1}` : ''}`}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * index, duration: 0.4 }}
                  >
                    <div className="lb-rank">
                      {index < 3 ? medalEmoji[index] : `#${index + 1}`}
                    </div>
                    <div className="lb-avatar">
                      {leader.referrer?.gender === 'female' ? '👩' : '👨'}
                    </div>
                    <div className="lb-info">
                      <h3>{leader.referrer?.full_name || 'عضو مجهول'}</h3>
                      <span>{leader.referrer?.gym_id || '—'}</span>
                    </div>
                    <div className="lb-score" style={{ color: index < 3 ? medalColors[index] : 'var(--accent)' }}>
                      <span className="lb-score-num">{leader.points || 0}</span>
                      <span className="lb-score-label">دعوة</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* How it works section */}
        <motion.div
          className="lb-how-it-works"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.7 }}
        >
          <h2>كيف <span className="highlight-green">تكسب النقاط؟</span></h2>
          <div className="lb-steps">
            <div className="lb-step">
              <span className="lb-step-icon">📋</span>
              <h4>انسخ رابطك</h4>
              <p>احصل على رابط الدعوة الخاص بك من لوحة التحكم الشخصية.</p>
            </div>
            <div className="lb-step-arrow">←</div>
            <div className="lb-step">
              <span className="lb-step-icon">📱</span>
              <h4>شاركه</h4>
              <p>أرسله لأصدقائك وعائلتك الراغبين في الانضمام لـ Infinity Gym.</p>
            </div>
            <div className="lb-step-arrow">←</div>
            <div className="lb-step">
              <span className="lb-step-icon">🏆</span>
              <h4>احصل على المكافآت</h4>
              <p>عندما يفعّل أحدهم اشتراكه، تحصل على نقطة!</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Leaderboard;
