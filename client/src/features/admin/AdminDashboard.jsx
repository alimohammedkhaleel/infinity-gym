import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './AdminDashboard.css';
import QRScannerTab from './QRScannerTab';

const API = '/api/admin';
const getToken = () => localStorage.getItem('gym_token') || localStorage.getItem('token');

// ─── Generic API helper ────────────────────────────────────────────────────
const api = async (method, path, body) => {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem('gym_token');
      window.location.href = '/login';
    }
    throw new Error(data.message || 'Request failed');
  }
  return data;
};

// ─── Toast ─────────────────────────────────────────────────────────────────
const Toast = ({ msg }) => (
  <AnimatePresence>
    {msg && (
      <motion.div
        className={`admin-toast admin-toast-${msg.type}`}
        initial={{ opacity: 0, y: -40, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -40 }}
      >
        {msg.text}
      </motion.div>
    )}
  </AnimatePresence>
);

// ─── Modal ─────────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children }) => (
  <motion.div
    className="modal-overlay"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClose}
  >
    <motion.div
      className="modal-box"
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.85, opacity: 0 }}
      onClick={e => e.stopPropagation()}
    >
      <div className="modal-header">
        <h3>{title}</h3>
        <button className="modal-close" onClick={onClose}>✕</button>
      </div>
      {children}
    </motion.div>
  </motion.div>
);

// ─── ADMIN DASHBOARD ───────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('members');
  const [msg, setMsg] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => { if (d.success) setStats(d.stats); })
      .catch(() => {});
  }, []);

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3500);
  };

  const tabs = [
    { id: 'members',    icon: '👥', label: 'الأعضاء' },
    { id: 'scanner',    icon: '📷', label: 'ماسح QR' },
    { id: 'migrations', icon: '🔄', label: 'هجرة المشتركين' },
    { id: 'prices',     icon: '💰', label: 'الأسعار' },
    { id: 'classes',    icon: '🏋️', label: 'الكلاسات' },
    { id: 'schedules',  icon: '📅', label: 'المواعيد' },
    { id: 'whatsapp',   icon: '💬', label: 'WhatsApp Bot' },
  ];

  return (
    <div className="admin-page" dir="rtl">
      <Toast msg={msg} />

      {/* Header */}
      <div className="admin-header">
        <h1 className="admin-title">
          لوحة تحكم <span className="highlight-green">Infinity Gym</span>
        </h1>
        <p className="admin-subtitle">إدارة شاملة للأعضاء، الأسعار، والكلاسات</p>

        {/* Live Stats Bar */}
        {stats && (
          <div className="admin-stats-bar">
            <div className="admin-stat-item">
              <span className="admin-stat-num highlight-green">{stats.totalMembers}</span>
              <span className="admin-stat-lbl">إجمالي الأعضاء</span>
            </div>
            <div className="admin-stat-item">
              <span className="admin-stat-num" style={{ color: '#39ff14' }}>{stats.activeMembers}</span>
              <span className="admin-stat-lbl">اشتراكات نشطة</span>
            </div>
            <div className="admin-stat-item">
              <span className="admin-stat-num">{stats.totalClasses}</span>
              <span className="admin-stat-lbl">كلاسات</span>
            </div>
            <div className="admin-stat-item">
              <span className="admin-stat-num" style={{ color: '#ffb347' }}>{stats.totalRevenue ? Number(stats.totalRevenue).toLocaleString('ar-EG') : 0} ج.م</span>
              <span className="admin-stat-lbl">الإيرادات</span>
            </div>
          </div>
        )}
      </div>

      {/* Tab Nav */}
      <div className="admin-tabs">
        {tabs.map(t => (
          <button
            key={t.id}
            className={`admin-tab-btn ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="admin-tab-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
          >
            {activeTab === 'members'    && <MembersTab    showMsg={showMsg} />}
            {activeTab === 'scanner'    && <QRScannerTab  showMsg={showMsg} />}
            {activeTab === 'migrations' && <MigrationTab  showMsg={showMsg} />}
            {activeTab === 'prices'     && <PricesTab     showMsg={showMsg} />}
            {activeTab === 'classes'    && <ClassesTab    showMsg={showMsg} />}
            {activeTab === 'schedules'  && <SchedulesTab  showMsg={showMsg} />}
            {activeTab === 'whatsapp'   && <WhatsAppTab   showMsg={showMsg} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// MEMBERS TAB
// ═══════════════════════════════════════════════════════════════════════════
const MembersTab = ({ showMsg }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activateModal, setActivateModal] = useState(null);
  const [freezeModal, setFreezeModal] = useState(null);
  const [freezeDays, setFreezeDays] = useState(7);
  const [inbodyModal, setInbodyModal] = useState(null);
  const [inbodyHistory, setInbodyHistory] = useState([]);
  const [inbodyForm, setInbodyForm] = useState({});
  const [pricePlans, setPricePlans] = useState([]);
  const [gymClasses, setGymClasses] = useState([]);
  const [form, setForm] = useState({
    subscription_type: 'monthly',
    gym_class_id: '',
    duration_months: 1,
    amount_paid: '',
    expected_price: 0,
    password: ''
  });

  const load = useCallback(async () => {
    try {
      const data = await api('GET', '/members');
      setMembers(data.members || []);
    } catch (e) { showMsg(e.message, 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    load();
    // Load price plans + gym classes for the activation modal
    Promise.all([
      api('GET', '/price-plans'),
      api('GET', '/classes'),
    ]).then(([priceData, classData]) => {
      setPricePlans(priceData.plans || []);
      setGymClasses(classData.classes || []);
    }).catch(() => {});
  }, [load]);

  const openActivateModal = (member) => {
    const defaultPlan = pricePlans.find(p => p.duration_months === 1);
    const expectedPrice = defaultPlan
      ? (member.gender === 'male' ? defaultPlan.price_male : defaultPlan.price_female)
      : 0;
    // Filter classes available for this member's gender
    const availableClasses = gymClasses.filter(
      c => c.gender === 'both' || c.gender === member.gender
    );
    const defaultClass = availableClasses[0];
    setForm({
      subscription_type: defaultClass ? String(defaultClass.id) : 'general',
      gym_class_id: defaultClass ? defaultClass.id : '',
      duration_months: 1,
      amount_paid: '',
      expected_price: Number(expectedPrice),
      password: ''
    });
    setActivateModal(member);
  };

  const handleDurationChange = (months) => {
    const plan = pricePlans.find(p => p.duration_months === parseInt(months));
    const expectedPrice = plan
      ? (activateModal?.gender === 'male' ? plan.price_male : plan.price_female)
      : 0;
    setForm(f => ({ ...f, duration_months: parseInt(months), expected_price: Number(expectedPrice) }));
  };

  const handleClassChange = (classId) => {
    const selected = gymClasses.find(c => c.id === parseInt(classId));
    setForm(f => ({
      ...f,
      gym_class_id: classId,
      subscription_type: selected ? selected.name : 'general'
    }));
  };

  const handleActivate = async () => {
    try {
      await api('PUT', `/members/${activateModal.id}/activate`, form);
      showMsg(`✅ تم تفعيل ${activateModal.full_name} بنجاح`);
      setActivateModal(null);
      load();
    } catch (e) { showMsg(e.message, 'error'); }
  };

  const openInbody = async (member) => {
    setInbodyModal(member);
    setInbodyForm({ user_id: member.id, weight: '', skeletal_muscle_mass: '', body_fat_mass: '', body_fat_percentage: '', water_percentage: '', bmi: '' });
    try {
      const data = await api('GET', `/members/${member.id}/inbody`);
      setInbodyHistory(data.records || []);
    } catch (e) { showMsg(e.message, 'error'); }
  };

  const saveInbody = async () => {
    try {
      await api('POST', `/members/${inbodyModal.id}/inbody`, inbodyForm);
      showMsg('✅ تم إضافة قياسات InBody بنجاح');
      openInbody(inbodyModal); // Reload history
    } catch (e) { showMsg(e.message, 'error'); }
  };

  const deleteInbody = async (id) => {
    if(!window.confirm('هل أنت متأكد من الحذف؟')) return;
    try {
      await api('DELETE', `/inbody/${id}`);
      showMsg('🗑️ تم الحذف بنجاح');
      openInbody(inbodyModal);
    } catch (e) { showMsg(e.message, 'error'); }
  };

  const handleFreeze = async () => {
    try {
      await api('PUT', `/members/${freezeModal.id}/freeze`, { duration_days: freezeDays });
      showMsg(`✅ تم تجميد اشتراك ${freezeModal.full_name} بنجاح`);
      setFreezeModal(null);
      load();
    } catch (e) { showMsg(e.message, 'error'); }
  };

  const handleUnfreeze = async (member) => {
    if(!window.confirm(`هل أنت متأكد من تفعيل اشتراك ${member.full_name}؟`)) return;
    try {
      await api('PUT', `/members/${member.id}/unfreeze`);
      showMsg(`✅ تم تفعيل اشتراك ${member.full_name} بنجاح`);
      load();
    } catch (e) { showMsg(e.message, 'error'); }
  };

  const handleDelete = async (member) => {
    if(!window.confirm(`هل أنت متأكد من حذف ${member.full_name} نهائياً؟`)) return;
    try {
      await api('DELETE', `/members/${member.id}`);
      showMsg('🗑️ تم حذف المستخدم بنجاح');
      load();
    } catch (e) { showMsg(e.message, 'error'); }
  };


  const filtered = members.filter(m =>
    (m.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (m.gym_id || '').toLowerCase().includes(search.toLowerCase()) ||
    (m.phone || '').includes(search)
  );

  if (loading) return <div className="admin-loading"><div className="admin-spinner" /><p>جاري التحميل...</p></div>;

  return (
    <div>
      <div className="admin-toolbar">
        <h2 className="admin-section-title">👥 جميع الأعضاء ({members.length})</h2>
        <input
          className="admin-search"
          type="text"
          placeholder="🔍 بحث بالاسم، ID، أو رقم الهاتف..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>الاسم</th>
              <th>Gym ID</th>
              <th>الهاتف</th>
              <th>النوع</th>
              <th>الحالة</th>
              <th>انتهاء الاشتراك</th>
              <th>إجراء</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => (
              <tr key={m.id}>
                <td data-label="الاسم"><strong>{m.full_name}</strong></td>
                <td data-label="Gym ID"><code>{m.gym_id}</code></td>
                <td data-label="الهاتف" dir="ltr">{m.phone}</td>
                <td data-label="النوع">{m.gender === 'male' ? '👨 رجال' : '👩 سيدات'}</td>
                <td data-label="الحالة">
                  <span className={`status-badge status-${m.status}`}>
                    {m.status === 'active' ? '🟢 نشط' :
                     m.status === 'inactive' ? '⚪ غير نشط' :
                     m.status === 'frozen' ? '❄️ مجمد' :
                     m.status === 'expired' ? '🔴 منتهي' : m.status}
                  </span>
                </td>
                <td data-label="انتهاء الاشتراك">{m.subscription_end ? new Date(m.subscription_end).toLocaleDateString('ar-EG') : '—'}</td>
                <td data-label="إجراءات" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button className="btn-sm btn-green" onClick={() => openActivateModal(m)}>تفعيل / تمديد</button>
                  <button className="btn-sm" style={{ background: '#0dcaf0', color: '#000', border: 'none' }} onClick={() => openInbody(m)}>⚖️ InBody</button>
                  {m.status === 'active' && <button className="btn-sm" style={{ background: '#6c757d', color: '#fff', border: 'none' }} onClick={() => setFreezeModal(m)}>❄️ تجميد</button>}
                  {m.status === 'frozen' && <button className="btn-sm" style={{ background: '#ffc107', color: '#000', border: 'none' }} onClick={() => handleUnfreeze(m)}>🔥 فك التجميد</button>}
                  <button className="btn-sm" style={{ background: '#dc3545', color: '#fff', border: 'none' }} onClick={() => handleDelete(m)}>🗑️ حذف</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="admin-empty">لا توجد نتائج.</p>}
      </div>

      <AnimatePresence>
        {activateModal && (
          <Modal title={`تفعيل اشتراك: ${activateModal.full_name}`} onClose={() => setActivateModal(null)}>
            <div className="modal-form">

              {/* نوع الكلاس من الـ database */}
              <label>نوع الكلاس / الاشتراك</label>
              {gymClasses.filter(c => c.gender === 'both' || c.gender === activateModal.gender).length > 0 ? (
                <select
                  value={form.gym_class_id}
                  onChange={e => handleClassChange(e.target.value)}
                >
                  {gymClasses
                    .filter(c => c.gender === 'both' || c.gender === activateModal.gender)
                    .map(c => (
                      <option key={c.id} value={c.id}>
                        {c.icon ? `${c.icon} ` : ''}{c.name}
                        {c.gender !== 'both' ? (c.gender === 'male' ? ' — رجال' : ' — سيدات') : ''}
                      </option>
                    ))
                  }
                </select>
              ) : (
                <div style={{ padding: '0.5rem', color: '#888', fontSize: '0.85rem', background: 'rgba(255,255,255,0.04)', borderRadius: '8px' }}>
                  لا توجد كلاسات متاحة — أضف كلاسات من تاب "الكلاسات"
                </div>
              )}

              {/* المدة من خطط الأسعار */}
              <label>المدة</label>
              {pricePlans.length > 0 ? (
                <select value={form.duration_months} onChange={e => handleDurationChange(e.target.value)}>
                  {pricePlans.map(p => (
                    <option key={p.id} value={p.duration_months}>
                      {p.label} — {activateModal.gender === 'male'
                        ? Number(p.price_male).toLocaleString('ar-EG')
                        : Number(p.price_female).toLocaleString('ar-EG')} ج.م
                    </option>
                  ))}
                </select>
              ) : (
                <select value={form.duration_months} onChange={e => handleDurationChange(e.target.value)}>
                  {[1,2,3,4,6,12].map(m => (
                    <option key={m} value={m}>{m} {m === 12 ? 'شهر (سنة)' : m === 1 ? 'شهر' : 'أشهر'}</option>
                  ))}
                </select>
              )}

              {/* السعر المتوقع */}
              {form.expected_price > 0 && (
                <div className="activate-price-box">
                  <span>💰 السعر المحدد ({activateModal.gender === 'male' ? 'رجال' : 'سيدات'}):</span>
                  <strong>{Number(form.expected_price).toLocaleString('ar-EG')} ج.م</strong>
                </div>
              )}

              {/* المبلغ المدفوع */}
              <label>المبلغ المدفوع (ج.م)</label>
              <input
                type="number"
                min="0"
                value={form.amount_paid}
                onChange={e => setForm({ ...form, amount_paid: e.target.value })}
                placeholder="أدخل المبلغ الذي دفعه العضو"
              />

              {/* باقي المبلغ */}
              {form.amount_paid !== '' && form.expected_price > 0 && (
                <div className={`activate-remaining ${Number(form.amount_paid) >= form.expected_price ? 'paid-full' : 'paid-partial'}`}>
                  <span>
                    {Number(form.amount_paid) >= form.expected_price ? '✅ المبلغ مكتمل' : '⚠️ باقي المبلغ:'}
                  </span>
                  <strong>
                    {Number(form.amount_paid) >= form.expected_price
                      ? (Number(form.amount_paid) - form.expected_price > 0
                          ? `زيادة: ${(Number(form.amount_paid) - form.expected_price).toLocaleString()} ج.م`
                          : 'مكتمل ✓')
                      : `${(form.expected_price - Number(form.amount_paid)).toLocaleString('ar-EG')} ج.م`}
                  </strong>
                </div>
              )}

              {/* كلمة المرور الجديدة (اختيارية) */}
              <label>كلمة المرور الجديدة (اختيارية)</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="اتركها فارغة للإبقاء على كلمة المرور الحالية"
                autoComplete="new-password"
              />

              <button className="btn-primary full-btn" onClick={handleActivate}>✅ تأكيد التفعيل</button>
            </div>
          </Modal>
        )}

        {freezeModal && (
          <Modal title={`تجميد اشتراك: ${freezeModal.full_name}`} onClose={() => setFreezeModal(null)}>
            <div className="modal-form">
              <label>مدة التجميد (بالأيام)</label>
              <input
                type="number"
                min="1"
                value={freezeDays}
                onChange={e => setFreezeDays(parseInt(e.target.value) || 0)}
                placeholder="أدخل عدد الأيام"
              />
              <button className="btn-primary full-btn" style={{ background: '#6c757d' }} onClick={handleFreeze}>❄️ تأكيد التجميد</button>
            </div>
          </Modal>
        )}

        {inbodyModal && (
          <Modal title={`قياسات InBody: ${inbodyModal.full_name}`} onClose={() => setInbodyModal(null)}>
            <div className="modal-form" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', maxHeight: '70vh', overflowY: 'auto', paddingRight: '1rem' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <h4 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>إضافة قياس جديد</h4>
              </div>
              <div>
                <label>الوزن (kg)</label>
                <input type="number" value={inbodyForm.weight} onChange={e => setInbodyForm({...inbodyForm, weight: e.target.value})} />
              </div>
              <div>
                <label>كتلة العضلات (kg)</label>
                <input type="number" value={inbodyForm.skeletal_muscle_mass} onChange={e => setInbodyForm({...inbodyForm, skeletal_muscle_mass: e.target.value})} />
              </div>
              <div>
                <label>كتلة الدهون (kg)</label>
                <input type="number" value={inbodyForm.body_fat_mass} onChange={e => setInbodyForm({...inbodyForm, body_fat_mass: e.target.value})} />
              </div>
              <div>
                <label>نسبة الدهون (%)</label>
                <input type="number" value={inbodyForm.body_fat_percentage} onChange={e => setInbodyForm({...inbodyForm, body_fat_percentage: e.target.value})} />
              </div>
              <div>
                <label>نسبة الماء (%)</label>
                <input type="number" value={inbodyForm.water_percentage} onChange={e => setInbodyForm({...inbodyForm, water_percentage: e.target.value})} />
              </div>
              <div>
                <label>BMI</label>
                <input type="number" value={inbodyForm.bmi} onChange={e => setInbodyForm({...inbodyForm, bmi: e.target.value})} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <button className="btn-primary full-btn" onClick={saveInbody}>💾 حفظ القياس</button>
              </div>

              <div style={{ gridColumn: '1 / -1', marginTop: '2rem' }}>
                <h4 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>سجل القياسات السابقة</h4>
                {inbodyHistory.length === 0 ? <p style={{ color: 'gray' }}>لا توجد قياسات سابقة.</p> : (
                  <table className="admin-table" style={{ fontSize: '0.85rem' }}>
                    <thead><tr><th>التاريخ</th><th>الوزن</th><th>العضلات</th><th>الدهون %</th><th>إجراء</th></tr></thead>
                    <tbody>
                      {inbodyHistory.map(h => (
                        <tr key={h.id}>
                          <td data-label="التاريخ">{new Date(h.test_date).toLocaleDateString('ar-EG')}</td>
                          <td data-label="الوزن">{h.weight} kg</td>
                          <td data-label="العضلات">{h.skeletal_muscle_mass} kg</td>
                          <td data-label="الدهون %">{h.body_fat_percentage}%</td>
                          <td data-label="إجراء"><button className="btn-sm btn-red" onClick={() => deleteInbody(h.id)}>🗑️</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// MIGRATIONS TAB
// ═══════════════════════════════════════════════════════════════════════════
const MigrationTab = ({ showMsg }) => {
  const [migrations, setMigrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [migrationLink, setMigrationLink] = useState('');
  const [expiresIn, setExpiresIn] = useState('7d');

  const load = useCallback(async () => {
    try {
      const data = await api('GET', '/migration/pending');
      setMigrations(data.members || []);
    } catch (e) { showMsg(e.message, 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const generateLink = async () => {
    try {
      const data = await api('POST', '/migration/token', { expiresIn });
      const link = `${window.location.origin}/migrate?token=${data.token}`;
      setMigrationLink(link);
      showMsg('✅ تم إنشاء الرابط بنجاح!');
    } catch (e) { showMsg(e.message, 'error'); }
  };

  const handleApprove = async (id, name) => {
    try {
      const data = await api('PUT', `/migration/${id}/approve`);
      showMsg(`✅ تم تفعيل ${name} — Gym ID: ${data.gym_id || ''}`, 'success');
      setMigrations(p => p.filter(m => m.id !== id));
    } catch (e) { showMsg(e.message, 'error'); }
  };

  return (
    <div className="admin-grid-2">
      {/* Generate Link Card */}
      <div className="admin-card">
        <h2>🔗 إنشاء رابط للمشتركين الحاليين</h2>
        <div className="migration-how-it-works">
          <h4>📋 كيف يعمل النظام؟</h4>
          <div className="migration-steps">
            <div className="migration-step">
              <span className="step-num">1</span>
              <div>
                <strong>أنشئ الرابط</strong>
                <p>اضغط "إنشاء رابط جديد" وحدد المدة الصالحة</p>
              </div>
            </div>
            <div className="migration-step">
              <span className="step-num">2</span>
              <div>
                <strong>أرسله للمشترك</strong>
                <p>أرسل الرابط للمشترك القديم عبر واتساب أو رسالة</p>
              </div>
            </div>
            <div className="migration-step">
              <span className="step-num">3</span>
              <div>
                <strong>المشترك يملأ بياناته</strong>
                <p>يفتح الرابط ويدخل: الاسم، الهاتف، الجنس، تاريخ انتهاء اشتراكه</p>
              </div>
            </div>
            <div className="migration-step">
              <span className="step-num">4</span>
              <div>
                <strong>أنت توافق وتفعّل</strong>
                <p>يظهر الطلب في "الطلبات المعلقة". اضغط موافقة لتفعيل الحساب</p>
              </div>
            </div>
            <div className="migration-step">
              <span className="step-num">5</span>
              <div>
                <strong>المشترك يسجل دخوله</strong>
                <p>يدخل بـ Gym ID + كلمة مرور مؤقتة = <strong style={{color:'#39ff14'}}>آخر 6 أرقام من رقم هاتفه</strong></p>
              </div>
            </div>
          </div>
        </div>
        <div className="admin-row" style={{ marginTop: '1.5rem' }}>
          <label>صلاحية الرابط:</label>
          <select value={expiresIn} onChange={e => setExpiresIn(e.target.value)}>
            <option value="24h">24 ساعة</option>
            <option value="5d">5 أيام</option>
            <option value="7d">أسبوع</option>
          </select>
        </div>
        <button className="btn-primary" onClick={generateLink}>🔗 إنشاء رابط جديد</button>
        {migrationLink && (
          <div className="link-box">
            <input type="text" readOnly value={migrationLink} onClick={e => e.target.select()} />
            <button className="btn-outline-sm" onClick={() => { navigator.clipboard.writeText(migrationLink); showMsg('📋 تم النسخ!'); }}>
              نسخ
            </button>
          </div>
        )}
        {migrationLink && (
          <div style={{ marginTop: '0.8rem', padding: '0.8rem', background: 'rgba(37,211,102,0.06)', border: '1px solid rgba(37,211,102,0.2)', borderRadius: '8px', fontSize: '0.82rem', color: '#aaa' }}>
            💡 يمكنك إرسال هذا الرابط مباشرة عبر{' '}
            <button
              style={{ background: 'none', border: 'none', color: '#25d366', cursor: 'pointer', textDecoration: 'underline', padding: 0, font: 'inherit' }}
              onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent('🏋️ مرحباً! سجّل بياناتك في Infinity Gym عبر هذا الرابط:\n' + migrationLink)}`, '_blank')}
            >
              واتساب
            </button>
          </div>
        )}
      </div>

      {/* Pending Migrations */}
      <div className="admin-card">
        <h2>⏳ طلبات الدخول المعلقة ({migrations.length})</h2>
        <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '1rem' }}>
          هؤلاء مشتركون قدامى ملأوا بياناتهم. وافق عليهم لتفعيل حساباتهم.
        </p>
        {loading ? (
          <div className="admin-loading"><div className="admin-spinner" /></div>
        ) : migrations.length === 0 ? (
          <p className="admin-empty">لا توجد طلبات معلقة حالياً ✅</p>
        ) : (
          <div className="migration-list">
            {migrations.map(m => (
              <div key={m.id} className="migration-row">
                <div>
                  <strong>{m.full_name}</strong>
                  <span style={{ color: '#888', fontSize: '0.85rem' }}> — {m.phone}</span>
                  {m.subscription_end && (
                    <span style={{ color: '#39ff14', fontSize: '0.82rem', display: 'block', marginTop: '2px' }}>
                      📅 ينتهي: {new Date(m.subscription_end).toLocaleDateString('ar-EG')}
                    </span>
                  )}
                  <span style={{ fontSize: '0.78rem', color: '#555', marginTop: '2px', display: 'block' }}>
                    🔑 كلمة المرور: اختارها بنفسه عند التسجيل
                  </span>
                </div>
                <div data-label="إجراء" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                  <button
                    className="btn-sm"
                    style={{ background: '#25d366', color: '#fff', border: 'none' }}
                    onClick={() => {
                      const msg = `مرحباً ${m.full_name}! ✅ تم تفعيل حسابك في Infinity Gym.\n🪪 Gym ID: ${m.gym_id}\n🔑 كلمة المرور: التي اخترتها عند التسجيل\n🌐 سجل دخولك من: ${window.location.origin}/login`;
                      window.open(`https://wa.me/${m.phone?.replace(/\D/g,'')}?text=${encodeURIComponent(msg)}`, '_blank');
                    }}
                  >
                    📱 إرسال بيانات الدخول
                  </button>
                  <button className="btn-sm btn-green" onClick={() => handleApprove(m.id, m.full_name)}>
                    ✅ موافقة وتفعيل
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// PRICES TAB
// ═══════════════════════════════════════════════════════════════════════════
const PricesTab = ({ showMsg }) => {
  const [plans, setPlans] = useState([]);
  const [editModal, setEditModal] = useState(null);
  const [addModal, setAddModal] = useState(false);
  const [form, setForm] = useState({});

  const load = async () => {
    const d = await api('GET', '/price-plans');
    setPlans(d.plans || []);
  };
  useEffect(() => { load(); }, []);

  const openEdit = (plan) => { setForm({ ...plan }); setEditModal(plan); };
  const openAdd = () => {
    setForm({ label: '', duration_months: 1, price_male: 0, price_female: 0 });
    setAddModal(true);
  };

  const save = async () => {
    try {
      if (editModal) {
        await api('PUT', `/price-plans/${editModal.id}`, form);
        showMsg('✅ تم تحديث السعر');
      } else {
        await api('POST', '/price-plans', form);
        showMsg('✅ تم إضافة السعر');
      }
      setEditModal(null); setAddModal(false); load();
    } catch (e) { showMsg(e.message, 'error'); }
  };

  const remove = async (id) => {
    if (!window.confirm('حذف هذا السعر؟')) return;
    try { await api('DELETE', `/price-plans/${id}`); showMsg('🗑️ تم الحذف'); load(); }
    catch (e) { showMsg(e.message, 'error'); }
  };

  return (
    <div>
      <div className="admin-toolbar">
        <h2 className="admin-section-title">💰 أسعار الاشتراكات</h2>
        <button className="btn-primary" onClick={openAdd}>+ إضافة سعر</button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>المدة</th><th>الشهور</th><th>سعر رجال</th><th>سعر سيدات</th><th>إجراءات</th></tr>
          </thead>
          <tbody>
            {plans.map(p => (
              <tr key={p.id}>
                <td data-label="المدة"><strong>{p.label}</strong></td>
                <td data-label="الشهور">{p.duration_months}</td>
                <td data-label="سعر رجال" className="price-cell">{p.price_male?.toLocaleString()} ج.م</td>
                <td data-label="سعر سيدات" className="price-cell">{p.price_female?.toLocaleString()} ج.م</td>
                <td data-label="إجراءات">
                  <button className="btn-sm btn-blue" onClick={() => openEdit(p)}>✏️ تعديل</button>
                  <button className="btn-sm btn-red" onClick={() => remove(p.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {(editModal || addModal) && (
          <Modal
            title={editModal ? `تعديل: ${editModal.label}` : 'إضافة سعر جديد'}
            onClose={() => { setEditModal(null); setAddModal(false); }}
          >
            <div className="modal-form">
              <label>اسم الفترة (مثال: 3 Months)</label>
              <input value={form.label || ''} onChange={e => setForm({ ...form, label: e.target.value })} />
              <label>عدد الشهور</label>
              <input type="number" value={form.duration_months || ''} onChange={e => setForm({ ...form, duration_months: parseInt(e.target.value) })} />
              <label>سعر الرجال (ج.م)</label>
              <input type="number" value={form.price_male || ''} onChange={e => setForm({ ...form, price_male: parseFloat(e.target.value) })} />
              <label>سعر السيدات (ج.م)</label>
              <input type="number" value={form.price_female || ''} onChange={e => setForm({ ...form, price_female: parseFloat(e.target.value) })} />
              <button className="btn-primary full-btn" onClick={save}>💾 حفظ</button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// CLASSES TAB
// ═══════════════════════════════════════════════════════════════════════════
const ClassesTab = ({ showMsg }) => {
  const [classes, setClasses] = useState([]);
  const [editModal, setEditModal] = useState(null);
  const [addModal, setAddModal] = useState(false);
  const [form, setForm] = useState({});

  const load = async () => {
    const d = await api('GET', '/classes');
    setClasses(d.classes || []);
  };
  useEffect(() => { load(); }, []);

  const openEdit = (c) => { setForm({ ...c }); setEditModal(c); };
  const openAdd = () => { setForm({ name: '', description: '', gender: 'both', icon: '🏋️' }); setAddModal(true); };

  const save = async () => {
    try {
      if (editModal) {
        await api('PUT', `/classes/${editModal.id}`, form);
        showMsg('✅ تم تحديث الكلاس');
      } else {
        await api('POST', '/classes', form);
        showMsg('✅ تم إضافة الكلاس');
      }
      setEditModal(null); setAddModal(false); load();
    } catch (e) { showMsg(e.message, 'error'); }
  };

  const remove = async (id) => {
    if (!window.confirm('حذف هذا الكلاس؟')) return;
    try { await api('DELETE', `/classes/${id}`); showMsg('🗑️ تم الحذف'); load(); }
    catch (e) { showMsg(e.message, 'error'); }
  };

  return (
    <div>
      <div className="admin-toolbar">
        <h2 className="admin-section-title">🏋️ الكلاسات المتاحة</h2>
        <button className="btn-primary" onClick={openAdd}>+ إضافة كلاس</button>
      </div>

      <div className="classes-grid">
        {classes.map(c => (
          <div key={c.id} className="class-card">
            <div className="class-icon">{c.icon}</div>
            <h3>{c.name}</h3>
            <p>{c.description}</p>
            <span className={`gender-badge gender-${c.gender}`}>
              {c.gender === 'both' ? '👥 الجميع' : c.gender === 'male' ? '👨 رجال' : '👩 سيدات'}
            </span>
            <div className="class-actions">
              <button className="btn-sm btn-blue" onClick={() => openEdit(c)}>✏️ تعديل</button>
              <button className="btn-sm btn-red" onClick={() => remove(c.id)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {(editModal || addModal) && (
          <Modal
            title={editModal ? `تعديل: ${editModal.name}` : 'إضافة كلاس جديد'}
            onClose={() => { setEditModal(null); setAddModal(false); }}
          >
            <div className="modal-form">
              <label>اسم الكلاس</label>
              <input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
              <label>الوصف</label>
              <textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
              <label>الأيقونة (Emoji)</label>
              <input value={form.icon || ''} onChange={e => setForm({ ...form, icon: e.target.value })} />
              <label>للجنس</label>
              <select value={form.gender || 'both'} onChange={e => setForm({ ...form, gender: e.target.value })}>
                <option value="both">الجميع</option>
                <option value="male">رجال فقط</option>
                <option value="female">سيدات فقط</option>
              </select>
              <button className="btn-primary full-btn" onClick={save}>💾 حفظ</button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SCHEDULES TAB
// ═══════════════════════════════════════════════════════════════════════════
const SchedulesTab = ({ showMsg }) => {
  const [schedules, setSchedules] = useState([]);
  const [editModal, setEditModal] = useState(null);
  const [addModal, setAddModal] = useState(false);
  const [form, setForm] = useState({});

  const load = async () => {
    const d = await api('GET', '/schedules');
    setSchedules(d.schedules || []);
  };
  useEffect(() => { load(); }, []);

  const openEdit = (s) => { setForm({ ...s }); setEditModal(s); };
  const openAdd = () => {
    setForm({ gender: 'male', day_group: 'Saturday - Thursday', time_from: '09:00 AM', time_to: '12:00 PM', label: 'Morning' });
    setAddModal(true);
  };

  const save = async () => {
    try {
      if (editModal) {
        await api('PUT', `/schedules/${editModal.id}`, form);
        showMsg('✅ تم تحديث الموعد');
      } else {
        await api('POST', '/schedules', form);
        showMsg('✅ تم إضافة الموعد');
      }
      setEditModal(null); setAddModal(false); load();
    } catch (e) { showMsg(e.message, 'error'); }
  };

  const remove = async (id) => {
    if (!window.confirm('حذف هذا الموعد؟')) return;
    try { await api('DELETE', `/schedules/${id}`); showMsg('🗑️ تم الحذف'); load(); }
    catch (e) { showMsg(e.message, 'error'); }
  };

  const male = schedules.filter(s => s.gender === 'male');
  const female = schedules.filter(s => s.gender === 'female');

  const ScheduleGroup = ({ title, icon, items }) => (
    <div className="schedule-group">
      <h3>{icon} {title}</h3>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>الأيام</th><th>من</th><th>إلى</th><th>الفترة</th><th>إجراءات</th></tr></thead>
          <tbody>
            {items.map(s => (
              <tr key={s.id}>
                <td data-label="الأيام">{s.day_group}</td>
                <td data-label="من" dir="ltr">{s.time_from}</td>
                <td data-label="إلى" dir="ltr">{s.time_to}</td>
                <td data-label="الفترة">{s.label}</td>
                <td data-label="إجراءات">
                  <button className="btn-sm btn-blue" onClick={() => openEdit(s)}>✏️</button>
                  <button className="btn-sm btn-red" onClick={() => remove(s.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div>
      <div className="admin-toolbar">
        <h2 className="admin-section-title">📅 مواعيد الجيم</h2>
        <button className="btn-primary" onClick={openAdd}>+ إضافة موعد</button>
      </div>

      <ScheduleGroup title="مواعيد الرجال" icon="👨" items={male} />
      <ScheduleGroup title="مواعيد السيدات" icon="👩" items={female} />

      <AnimatePresence>
        {(editModal || addModal) && (
          <Modal
            title={editModal ? 'تعديل الموعد' : 'إضافة موعد جديد'}
            onClose={() => { setEditModal(null); setAddModal(false); }}
          >
            <div className="modal-form">
              <label>القسم</label>
              <select value={form.gender || 'male'} onChange={e => setForm({ ...form, gender: e.target.value })}>
                <option value="male">رجال</option>
                <option value="female">سيدات</option>
              </select>
              <label>الأيام</label>
              <input value={form.day_group || ''} onChange={e => setForm({ ...form, day_group: e.target.value })} placeholder="مثال: Saturday - Thursday" />
              <label>من</label>
              <input value={form.time_from || ''} onChange={e => setForm({ ...form, time_from: e.target.value })} placeholder="09:00 AM" />
              <label>إلى</label>
              <input value={form.time_to || ''} onChange={e => setForm({ ...form, time_to: e.target.value })} placeholder="12:00 PM" />
              <label>اسم الفترة</label>
              <input value={form.label || ''} onChange={e => setForm({ ...form, label: e.target.value })} placeholder="Morning / Evening / Night" />
              <button className="btn-primary full-btn" onClick={save}>💾 حفظ</button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// WHATSAPP TAB
// ═══════════════════════════════════════════════════════════════════════════
const WhatsAppTab = ({ showMsg }) => {
  const [message, setMessage] = useState('');
  const [members, setMembers] = useState([]);
  const [selected, setSelected] = useState([]); // array of member ids
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [waStatus, setWaStatus] = useState({ isConnected: false, qr: null });
  const [filterStatus, setFilterStatus] = useState('all'); // all | active | expired
  // Queue state for sequential sending
  const [sendQueue, setSendQueue] = useState(null); // { targets, index } | null

  // Fetch all members
  useEffect(() => {
    api('GET', '/members').then(data => {
      const list = data.members || [];
      setMembers(list);
      // select all by default
      setSelected(list.map(m => m.id));
    }).catch(() => showMsg('فشل تحميل الأعضاء', 'error'))
      .finally(() => setLoadingMembers(false));
  }, []);

  // Fetch WhatsApp bot status periodically
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await api('GET', '/whatsapp/status');
        setWaStatus({ isConnected: data.isConnected, qr: data.qr });
      } catch (err) { /* silent */ }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const templates = [
    { key: 'reminder', label: '⏰ تذكير يومي', text: '💪 مرحباً! لا تنسَ حضور جلستك اليوم في Infinity Gym. استمرارك هو مفتاح نجاحك! 🏋️' },
    { key: 'expiry',   label: '📅 إشعار انتهاء الاشتراك', text: '⚠️ تنبيه: اشتراكك في Infinity Gym على وشك الانتهاء. تواصل معنا لتجديده والاستمرار في رحلتك الرياضية! 💚' },
    { key: 'motivation', label: '🔥 رسالة تحفيزية', text: '🌟 أنت أقوى مما تظن! كل تمرين يقربك من نسخة أفضل منك. Infinity Gym معك في كل خطوة 💪' },
    { key: 'promo',    label: '🎁 عرض ترويجي', text: '🎉 عرض خاص من Infinity Gym! شارك مع صديق واستمتع بخصومات حصرية. اتصل بنا الآن! 📞' },
  ];

  const formatPhone = (phone) => {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('01') && cleaned.length === 11) cleaned = '2' + cleaned;
    else if (!cleaned.startsWith('20')) cleaned = '20' + cleaned;
    return cleaned;
  };

  const openWhatsApp = (toPhone, msg) => {
    const url = `https://wa.me/${formatPhone(toPhone)}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  // Filter members by status
  const filteredMembers = members.filter(m => {
    if (filterStatus === 'active') return m.status === 'active';
    if (filterStatus === 'expired') return m.status !== 'active';
    return true;
  });

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const selectAll = () => setSelected(filteredMembers.map(m => m.id));
  const deselectAll = () => setSelected([]);

  // ── Queue-based sequential sender ──────────────────────────────────────
  // Browsers block multiple window.open() calls from setTimeout.
  // Instead, we open one window at a time and let the user manually advance.
  const sendToAll = () => {
    if (!message.trim()) { showMsg('الرجاء كتابة الرسالة أولاً', 'error'); return; }
    const targets = filteredMembers.filter(m => selected.includes(m.id) && m.phone);
    if (targets.length === 0) { showMsg('لا يوجد أعضاء محددون أو ليس لديهم أرقام', 'error'); return; }
    // Open first contact immediately (direct user gesture — not blocked)
    setSendQueue({ targets, index: 0 });
    openWhatsApp(targets[0].phone, `مرحباً كابتن ${targets[0].full_name}،\n${message}`);
  };

  const sendNext = () => {
    if (!sendQueue) return;
    const nextIndex = sendQueue.index + 1;
    if (nextIndex >= sendQueue.targets.length) {
      setSendQueue(null);
      showMsg(`✅ تم الإرسال لجميع ${sendQueue.targets.length} عضو!`);
      return;
    }
    const m = sendQueue.targets[nextIndex];
    setSendQueue(prev => ({ ...prev, index: nextIndex }));
    openWhatsApp(m.phone, `مرحباً كابتن ${m.full_name}،\n${message}`);
  };

  const cancelQueue = () => {
    showMsg(`⛔ تم إيقاف الإرسال عند العضو ${(sendQueue?.index ?? 0) + 1}`);
    setSendQueue(null);
  };

  return (
    <div className="wa-tab">

      {/* ── Bot Status Bar ── */}
      <div className={`wa-status-bar ${waStatus.isConnected ? 'connected' : 'disconnected'}`}>
        <span className="wa-status-dot" />
        {waStatus.isConnected
          ? '✅ البوت متصل — الرسائل التلقائية تعمل يومياً الساعة 10 صباحاً'
          : waStatus.qr
            ? '📷 امسح كود QR أدناه لربط البوت'
            : '⏳ جاري تجهيز البوت...'}
        {waStatus.qr && !waStatus.isConnected && (
          <div className="wa-qr-inline">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(waStatus.qr)}`}
              alt="WhatsApp QR"
            />
          </div>
        )}
      </div>

      <div className="admin-grid-2" style={{ marginTop: '1.5rem' }}>

        {/* ── Bulk Message Panel ── */}
        <div className="admin-card" style={{ gridColumn: 'span 2' }}>
          <h2>📨 إرسال رسالة جماعية للأعضاء</h2>
          <p className="admin-card-desc">اختر الأعضاء ثم اكتب الرسالة لإرسالها لهم جميعاً دفعة واحدة عبر WhatsApp.</p>

          {/* Templates */}
          <div className="wa-templates" style={{ marginBottom: '1rem' }}>
            {templates.map(t => (
              <button key={t.key} className="wa-template-btn"
                onClick={() => { setMessage(t.text); showMsg('✅ تم تعبئة القالب!'); }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Message Box */}
          <textarea
            rows={4}
            placeholder="اكتب رسالتك هنا... (سيتم إضافة اسم العضو تلقائياً)"
            value={message}
            onChange={e => setMessage(e.target.value)}
            style={{ width: '100%', marginBottom: '1rem', resize: 'vertical', direction: 'rtl' }}
          />

          {/* Filter + Select Controls */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1rem' }}>
            <div className="pricing-gender-toggle" style={{ margin: 0 }}>
              {['all', 'active', 'expired'].map(f => (
                <button key={f}
                  className={`pricing-toggle-btn ${filterStatus === f ? 'active' : ''}`}
                  onClick={() => { setFilterStatus(f); setSelected([]); }}>
                  {f === 'all' ? '👥 الكل' : f === 'active' ? '✅ نشط' : '❌ منتهي'}
                </button>
              ))}
            </div>
            <button className="btn-secondary-sm" onClick={selectAll}>تحديد الكل</button>
            <button className="btn-secondary-sm" onClick={deselectAll}>إلغاء الكل</button>
            <span style={{ color: 'var(--accent)', fontWeight: 'bold', marginRight: 'auto' }}>
              {selected.length} محدد من {filteredMembers.length}
            </span>
          </div>

          {/* Members List */}
          <div className="wa-members-list">
            {loadingMembers ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>⏳ جاري تحميل الأعضاء...</p>
            ) : filteredMembers.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>لا يوجد أعضاء</p>
            ) : filteredMembers.map(m => (
              <div key={m.id}
                className={`wa-member-row ${selected.includes(m.id) ? 'selected' : ''}`}
                onClick={() => toggleSelect(m.id)}>
                <input type="checkbox" readOnly checked={selected.includes(m.id)} />
                <div className="wa-member-avatar">{(m.full_name || 'U')[0].toUpperCase()}</div>
                <div className="wa-member-info">
                  <span className="wa-member-name">{m.full_name}</span>
                  <span className="wa-member-phone" dir="ltr">{m.phone || 'لا يوجد رقم'}</span>
                </div>
                <span className={`member-badge ${m.status === 'active' ? 'active' : 'expired'}`}>
                  {m.status === 'active' ? 'نشط' : 'منتهي'}
                </span>
                {/* Send to single member */}
                {m.phone && (
                  <button
                    className="btn-whatsapp-sm"
                    onClick={e => { e.stopPropagation(); openWhatsApp(m.phone, `مرحباً كابتن ${m.full_name}،\n${message || '...'}`); }}
                    title="إرسال لهذا العضو فقط">
                    📱
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Send Button / Queue Progress */}
          {sendQueue ? (
            <div style={{ marginTop: '1.5rem', background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.3)', borderRadius: '12px', padding: '1.25rem' }}>
              {/* Progress bar */}
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#aaa', marginBottom: '0.4rem' }}>
                  <span>📤 جاري الإرسال...</span>
                  <span style={{ color: '#25d366', fontWeight: 'bold' }}>{sendQueue.index + 1} / {sendQueue.targets.length}</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: '#25d366', borderRadius: '99px', width: `${((sendQueue.index + 1) / sendQueue.targets.length) * 100}%`, transition: 'width 0.3s ease' }} />
                </div>
              </div>
              {/* Current member */}
              <p style={{ fontSize: '0.9rem', color: '#fff', marginBottom: '1rem', textAlign: 'center' }}>
                تم فتح واتساب لـ <strong style={{ color: '#25d366' }}>{sendQueue.targets[sendQueue.index]?.full_name}</strong>
                {sendQueue.index + 1 < sendQueue.targets.length && (
                  <span style={{ color: '#888', fontSize: '0.8rem', display: 'block', marginTop: '0.25rem' }}>
                    التالي: {sendQueue.targets[sendQueue.index + 1]?.full_name}
                  </span>
                )}
              </p>
              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  className="btn-whatsapp"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={sendNext}
                >
                  {sendQueue.index + 1 < sendQueue.targets.length
                    ? `➡️ التالي (${sendQueue.targets[sendQueue.index + 1]?.full_name})`
                    : '✅ إنهاء'}
                </button>
                <button
                  onClick={cancelQueue}
                  style={{ padding: '0.75rem 1.25rem', background: 'rgba(255,59,48,0.15)', border: '1px solid rgba(255,59,48,0.4)', borderRadius: '10px', color: '#ff3b30', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  ⛔ إيقاف
                </button>
              </div>
            </div>
          ) : (
            <button className="btn-whatsapp" style={{ marginTop: '1.5rem', width: '100%', justifyContent: 'center' }} onClick={sendToAll}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              إرسال لـ {selected.length} عضو عبر WhatsApp
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;

