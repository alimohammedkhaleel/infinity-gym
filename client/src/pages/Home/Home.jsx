import React, { useEffect, useRef, useState } from 'react';
import ScrollTube from '../../components/effects/ScrollTube';
import ImagesArcAnimation from '../../components/effects/ImagesArcAnimation';
import InfiniteMenu from '../../components/effects/InfiniteMenu';
import FundamentalPillars from '../../components/effects/FundamentalPillars';
import HomeHeroAnimation from '../../components/effects/HomeHeroAnimation';
import TextToImages from '../../components/effects/TextToImages';
import ImageStackReveal from '../../components/effects/ImageStackReveal';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link, useNavigate } from 'react-router-dom';
import imgCopy2 from '../../assets/image copy 2.png';
import imgCopy3 from '../../assets/image copy 3.png';
import imgCopy4 from '../../assets/image copy 8.png';
import imgCopy5 from '../../assets/image copy 9.png';
import imgCopy6 from '../../assets/image copy 6.png';
import './Home.css';

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const sectionsRef = useRef([]);
  const [stats, setStats] = useState({ totalMembers: '...', totalClasses: '...', weeklySchedules: '...' });
  const [pricePlans, setPricePlans] = useState([]);
  const [ptPlans, setPtPlans] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [pricingGender, setPricingGender] = useState('male');
  const [scheduleGender, setScheduleGender] = useState('male');
  const [priceLoading, setPriceLoading] = useState(true);

  // Fetch live stats + prices from DB
  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(data => { if (data.success) setStats(data.stats); })
      .catch(() => setStats({ totalMembers: 0, totalClasses: 0, weeklySchedules: 0 }));

    Promise.all([
      fetch('/api/admin/price-plans').then(r => r.json()),
      fetch('/api/admin/pt-plans').then(r => r.json()),
      fetch('/api/admin/schedules').then(r => r.json())
    ]).then(([priceData, ptData, scheduleData]) => {
      setPricePlans(priceData.plans || []);
      setPtPlans(ptData.plans || []);
      setSchedules(scheduleData.schedules || []);
    }).catch(() => {}).finally(() => setPriceLoading(false));
  }, []);

  const addToRefs = (el) => {
    if (el && !sectionsRef.current.includes(el)) {
      sectionsRef.current.push(el);
    }
  };

  useEffect(() => {
    let ctx = gsap.context(() => {
      const tl = gsap.timeline();

      const nav = document.querySelector('.navbar') || document.querySelector('nav');
      if (nav) {
        nav.style.transition = 'none';
        gsap.fromTo(nav,
          { y: -80, opacity: 0 },
          {
            y: 0, opacity: 1,
            duration: 1.2,
            ease: 'power3.out',
            delay: 0.3,
            clearProps: 'y,transform',
            onComplete: () => {
              nav.style.transition = '';
            }
          }
        );
      }

      sectionsRef.current.forEach((section) => {
        gsap.fromTo(section,
          { y: 60, opacity: 0 },
          {
            scrollTrigger: {
              trigger: section,
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            },
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: 'power3.out'
          }
        );
      });

      const tubeText = document.querySelector('.tube-text-animate');
      if (tubeText) {
        gsap.fromTo(tubeText.children,
          { x: 50, opacity: 0, scale: 0.9 }, // changed to positive for RTL
          { 
            scrollTrigger: {
              trigger: tubeText,
              start: 'top 80%',
            },
            x: 0, opacity: 1, scale: 1, duration: 1, stagger: 0.3, ease: 'back.out(1.5)' 
          }
        );
      }

      const coreSection = document.querySelector('.core-philosophy-section');
      if (coreSection) {
        const texts = coreSection.querySelectorAll('.section-title, .section-text');
        const hub = coreSection.querySelector('.topo-hub');
        const spokes = coreSection.querySelectorAll('.topo-spoke');
        
        const tlCore = gsap.timeline({
          scrollTrigger: {
            trigger: coreSection,
            start: 'top 75%',
          }
        });

        tlCore.fromTo(texts, 
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: 'power3.out' }
        )
        .fromTo(hub,
          { scale: 0, opacity: 0, rotation: 10, boxShadow: '0 0 0px rgba(57, 255, 20, 0)' },
          { scale: 1, opacity: 1, rotation: 0, boxShadow: '0 0 30px rgba(57, 255, 20, 0.4)', duration: 0.8, ease: 'back.out(1.7)' },
          "-=0.4"
        )
        .fromTo(spokes,
          { y: 30, opacity: 0, scale: 0.8 },
          { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.2, ease: 'back.out(1.5)' },
          "-=0.5"
        );
      }
    });

    return () => ctx.revert();
  }, []);

  const infiniteMenuItems = [
    { label: 'كارديو', image: imgCopy2 },
    { label: 'أوزان حرة', image: imgCopy3 },
    { label: 'يوجا', image: imgCopy4 },
    { label: 'تغذية', image: imgCopy5 },
    { label: 'تدريب شخصي', image: imgCopy6 }
  ];

  return (
    <div className="home-page" dir="rtl">

      {/* ======== HERO ======== */}
      <HomeHeroAnimation />

      {/* ======== SECTION 1: INFINITE MENU ======== */}
      <div ref={addToRefs}>
        <InfiniteMenu items={infiniteMenuItems} />
      </div>

      {/* ======== SECTION 2: SCROLL TUBE PATH EFFECT ======== */}
      <div className="home-tube-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4rem', flexWrap: 'wrap', direction: 'rtl' }}>
        <div className="tube-text-animate" style={{ flex: '1 1 400px' }}>
          <h2 className="section-title">التطور <span className="highlight-green">المستمر</span></h2>
          <p className="section-text" style={{ maxWidth: '100%' }}>
            نوفر لك أحدث الأجهزة لتتبع نبضات القلب والجهد العضلي لضمان تحقيق هدفك بسرعة وأمان.
          </p>
        </div>
        <div style={{ flex: '1 1 400px', display: 'flex', justifyContent: 'center' }}>
          <ScrollTube />
        </div>
      </div>

      {/* ======== NEW ANIMATIONS SECTION ======== */}
      <div className="home-animations-wrapper" style={{ width: '100%', direction: 'ltr', paddingTop: '10vh' }}>
          <TextToImages />
          <div style={{ marginTop: '150vh' }}>
            <ImageStackReveal />
          </div>
        </div>

      {/* ======== CORE PHILOSOPHY ======== */}
      <section className="content-section core-philosophy-section">
        <h2 className="section-title">فلسفتنا: <span className="highlight-green">بيئة واحدة متكاملة</span></h2>
        <p className="section-text">
          تاريخياً، كانت صالات الألعاب تعتمد على التدريب العشوائي. اليوم، <strong>Infinity Gym</strong> يغير هذه القاعدة عبر إتاحة متابعة إلكترونية، خطط تغذية، وتقارير تطور شهرية مبنية على أرقام وحقائق فعلية لضمان عدم ضياع مجهودك.
        </p>
        <div className="topology-diagram">
          <div className="topo-hub">
            <span>الفرع الرئيسي</span>
            <small>(مركز القيادة الرياضية)</small>
          </div>
          <div className="topo-spokes">
            <div className="topo-spoke">
              <span>كلاسات الزومبا</span>
              <small>(طاقة عالية)</small>
            </div>
            <div className="topo-spoke">
              <span>صالة الحديد</span>
              <small>(بناء العضلات)</small>
            </div>
          </div>
        </div>
        <p className="section-text">
          سواء كنت تبحث عن إنقاص الوزن أو بناء العضلات، نظامنا يربط بين التدريب والتغذية بشكل علمي ومثالي لضمان نتائج مذهلة.
        </p>
      </section>

      {/* ======== SECTION 4: SCROLLING IMAGES WITH STICKY NUMBER ======== */}
      <div ref={addToRefs} dir="ltr">
        <ImagesArcAnimation />
      </div>

      {/* ======== SECTION 5: FUNDAMENTAL PILLARS ======== */}
      <div ref={addToRefs} dir="ltr">
        <FundamentalPillars />
      </div>

      {/* ======== SECTION 5.5: SCHEDULES ======== */}
      <section className="schedules-section content-section" ref={addToRefs} dir="rtl" style={{ position: 'sticky', bottom: '0', zIndex: 1, paddingBottom: '10vh', paddingTop: '5vh' }}>
        <h2 className="section-title">
          مواعيد <span className="highlight-green">الجيم</span>
        </h2>
        <p className="section-text" style={{ marginBottom: '2rem' }}>
          تعرف على أوقات العمل المخصصة لكل من الرجال والسيدات.
        </p>
        <div className="pricing-gender-toggle">
          <button
            className={`pricing-toggle-btn ${scheduleGender === 'male' ? 'active' : ''}`}
            onClick={() => setScheduleGender('male')}
          >
            👨 رجال
          </button>
          <button
            className={`pricing-toggle-btn ${scheduleGender === 'female' ? 'active' : ''}`}
            onClick={() => setScheduleGender('female')}
          >
            👩 سيدات
          </button>
        </div>
        <div className="schedules-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'center', marginTop: '2rem' }}>
          {schedules.filter(s => s.gender === scheduleGender).map((sched) => (
            <div key={sched.id} className="pt-card" style={{ padding: '1.5rem', minWidth: '250px' }}>
              <h3 style={{ color: 'var(--accent)', marginBottom: '0.5rem', fontSize: '1.3rem' }}>{sched.label || 'ميعاد'}</h3>
              <p style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{sched.day_group}</p>
              <div style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px' }}>
                <div style={{ color: 'var(--text-muted)' }}>من: <span style={{ color: 'white' }}>{sched.time_from}</span></div>
                <div style={{ color: 'var(--text-muted)', marginTop: '5px' }}>إلى: <span style={{ color: 'white' }}>{sched.time_to}</span></div>
              </div>
            </div>
          ))}
          {schedules.filter(s => s.gender === scheduleGender).length === 0 && (
            <p style={{ color: 'var(--text-muted)' }}>لا توجد مواعيد مضافة حالياً.</p>
          )}
        </div>
      </section>

      {/* ======== SECTION 6: PRICING ======== */}
      <section className="pricing-section content-section" ref={addToRefs} style={{ position: 'relative', zIndex: 2, backgroundColor: 'var(--bg-color, #111)', paddingBottom: '10vh', borderTop: '2px solid rgba(255,255,255,0.05)', width: '100%', maxWidth: '100%', margin: '0', padding: '5vh 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 className="section-title">
          أسعار <span className="highlight-green">الاشتراكات</span>
        </h2>
        <p className="section-text" style={{ marginBottom: '2rem' }}>
          اختر الباقة المناسبة لك. جميع الباقات تشمل الوصول الكامل لكل أجهزة الجيم.
        </p>

        {/* Gender Toggle */}
        <div className="pricing-gender-toggle">
          <button
            className={`pricing-toggle-btn ${pricingGender === 'male' ? 'active' : ''}`}
            onClick={() => setPricingGender('male')}
          >
            👨 رجال
          </button>
          <button
            className={`pricing-toggle-btn ${pricingGender === 'female' ? 'active' : ''}`}
            onClick={() => setPricingGender('female')}
          >
            👩 سيدات
          </button>
        </div>

        {priceLoading ? (
          <div className="pricing-loading">
            <div className="pricing-spinner" />
            <p>جاري تحميل الأسعار...</p>
          </div>
        ) : (
          <>
            {/* Subscription Plans */}
            <div className="pricing-grid">
              {pricePlans.map((plan, i) => {
                const price = pricingGender === 'male' ? plan.price_male : plan.price_female;
                const isPopular = plan.duration_months === 3;
                return (
                  <div key={plan.id} className={`pricing-card ${isPopular ? 'pricing-card-popular' : ''}`}>
                    {isPopular && <div className="pricing-popular-badge">الأكثر طلباً ⭐</div>}
                    <div className="pricing-duration">{plan.label}</div>
                    <div className="pricing-price">
                      <span className="pricing-amount">{Number(price).toLocaleString('ar-EG')}</span>
                      <span className="pricing-currency">ج.م</span>
                    </div>
                    <div className="pricing-per-month">
                      {plan.duration_months > 1 && (
                        <span>{Math.round(price / plan.duration_months).toLocaleString('ar-EG')} ج.م / شهر</span>
                      )}
                    </div>
                    <ul className="pricing-features">
                      <li>✅ وصول كامل للجيم</li>
                      <li>✅ تتبع InBody</li>
                      <li>✅ كود دخول QR</li>
                      {plan.duration_months >= 3 && <li>✅ إمكانية تجميد الاشتراك</li>}
                    </ul>
                    <button
                      className={isPopular ? 'btn-primary pricing-cta' : 'btn-outline pricing-cta'}
                      onClick={() => navigate('/register')}
                    >
                      اشترك الآن
                    </button>
                  </div>
                );
              })}
            </div>


          </>
        )}

        <div className="pricing-cta-box">
          <p>مشترك قديم؟ سجّل بياناتك وفعّل حسابك بسهولة</p>
          <button className="btn-outline" onClick={() => navigate('/login')}>
            تسجيل الدخول / تفعيل الحساب
          </button>
        </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
