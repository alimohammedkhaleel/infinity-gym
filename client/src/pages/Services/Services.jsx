import React, { useState, useEffect, useRef } from 'react';
import FullscreenScrollVelocity from '../../components/effects/FullscreenScrollVelocity';
import ScrollTube from '../../components/effects/ScrollTube';
import ImagesArcAnimation from '../../components/effects/ImagesArcAnimation';
import InfiniteMenu from '../../components/effects/InfiniteMenu';
import FundamentalPillars from '../../components/effects/FundamentalPillars';
import Footer from '../../components/Footer';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import imgCopy2 from '../../assets/image copy 2.png';
import imgCopy3 from '../../assets/image copy 3.png';
import imgCopy4 from '../../assets/image copy 8.png';
import imgCopy5 from '../../assets/image copy 9.png';
import imgCopy6 from '../../assets/image copy 6.png';
import './Services.css';

gsap.registerPlugin(ScrollTrigger);

const Services = () => {
  const heroRef = useRef(null);
  const sectionsRef = useRef([]);
  const [servicesData, setServicesData] = useState([]);

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

      const spot = heroRef.current.querySelector('.hero-glow-spot');
      if (spot) {
        tl.fromTo(spot,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 2.5, ease: 'elastic.out(1, 0.4)' },
          0.5
        );
      }

      const badge = heroRef.current.querySelector('.hero-badge');
      if (badge) {
        tl.fromTo(badge,
          { y: 50, opacity: 0, scale: 0.5 },
          { y: 0, opacity: 1, scale: 1, duration: 1, ease: 'back.out(1.5)' },
          "-=2"
        );
      }

      const title = heroRef.current.querySelector('.hero-title');
      if (title) {
        tl.fromTo(title,
          { y: 80, opacity: 0, rotateX: -60, transformOrigin: 'top center' },
          { y: 0, opacity: 1, rotateX: 0, duration: 1.5, ease: 'power3.out' },
          "-=1.5"
        );
      }

      const cols = heroRef.current.querySelectorAll('.hero-col');
      if (cols.length) {
        tl.fromTo(cols,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: 'power2.out' },
          "-=1"
        );
      }

      const metrics = heroRef.current.querySelectorAll('.metric-box');
      if (metrics.length) {
        tl.fromTo(metrics,
          { scale: 0.8, opacity: 0, y: 20 },
          { scale: 1, opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'back.out(1.5)' },
          "-=0.6"
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
    { label: 'تغذية وصحة', image: imgCopy5 },
    { label: 'تدريب شخصي', image: imgCopy6 }
  ];

  useEffect(() => {
    // Fetch Dynamic Classes for Services Guide
    fetch('/api/admin/classes')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.classes) {
          const mapped = data.classes.map((cls, idx) => ({
            id: String(idx + 1).padStart(2, '0'),
            title: cls.name,
            desc: cls.description
          }));
          setServicesData(mapped);
        }
      })
      .catch(err => console.error('Failed to load classes', err));
  }, []);

  return (
    <div className="home-page" dir="rtl">

      {/* ======== HERO ======== */}
      <section className="hero-section" ref={heroRef}>
        
        {/* The Glowing Spot */}
        <div className="hero-glow-spot"></div>

        <div style={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="hero-animate hero-badge">دليل خدماتنا</div>
          <h1 className="hero-animate hero-title">
            الخدمات الرياضية <br />
            <span className="highlight-green">في Infinity Gym</span>
          </h1>
        
        {/* Asymmetrical Two-Column Hero Grid */}
        <div className="hero-animate hero-columns">
          <div className="hero-col col-right">
            <h3 className="hero-col-title">مفهوم تقديم الخدمة</h3>
            <p className="hero-col-text">
              في <strong>Infinity Gym</strong>، لا يقتصر دورنا على توفير أجهزة تدريب، بل نعمل كفريق عمل متكامل من المدربين، خبراء التغذية، والمتابعين لضمان تقديم أعلى جودة ممكنة لجميع المشتركين.
            </p>
          </div>
          <div className="hero-col col-left">
            <h3 className="hero-col-title">جودة لا مساومة عليها</h3>
            <p className="hero-col-text">
              تم تصميم هذه الخدمات لتلبية كافة المتطلبات سواء كنت مبتدئاً أو رياضياً محترفاً، وذلك عبر بيئة رياضية نظيفة وآمنة وداعمة لنجاحك.
            </p>
          </div>
        </div>

        {/* Premium Corporate/Government Metrics Bar */}
        <div className="hero-animate hero-metrics">
          <div className="metric-box">
            <span className="metric-num">+50</span>
            <span className="metric-label">جهاز متطور</span>
          </div>
          <div className="metric-box">
            <span className="metric-num">VIP</span>
            <span className="metric-label">تدريب شخصي</span>
          </div>
          <div className="metric-box">
            <span className="metric-num">24/7</span>
            <span className="metric-label">مفتوح طوال الأسبوع</span>
          </div>
        </div>
        </div>
      </section>

      {/* ======== SECTION 1: INFINITE MENU ======== */}
      <div ref={addToRefs}>
        <InfiniteMenu items={infiniteMenuItems} />
      </div>

      {/* ======== SECTION 2: SCROLL TUBE PATH EFFECT ======== */}
      <div className="home-tube-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4rem', flexWrap: 'wrap', direction: 'rtl' }}>
        <div className="tube-text-animate" style={{ flex: '1 1 400px' }}>
          <h2 className="section-title">استكشف <span className="highlight-green">خدماتنا</span> المتنوعة</h2>
          <p className="section-text" style={{ maxWidth: '100%' }}>
            فريق المدربين لدينا متاح دائماً لتوجيهك ومساعدتك في اختيار البرنامج الأنسب لتحقيق أهدافك.
          </p>
        </div>
        <div style={{ flex: '1 1 400px', display: 'flex', justifyContent: 'center' }}>
          <ScrollTube />
        </div>
      </div>

      {/* ======== SCROLL VELOCITY ======== */}
        <div style={{direction: 'rtl'}}>
          <FullscreenScrollVelocity 
            badgeText="مرحباً بك في Infinity Gym"
            titleLine1="تدريب"
            titleLine2="احترافي"
            subTitle="قوة • سرعة • لياقة"
            description="نقدم أفضل برامج اللياقة البدنية مع نخبة من المدربين المعتمدين وأحدث الأجهزة الرياضية لتحقيق أهدافك."
            techPills={["كارديو", "يوجا", "أوزان", "تدريب شخصي"]}
            epicSentence={(
              <>
                سواء كنت تهدف لـ <span className="creative-span" data-type="drop">تخسيس الوزن</span> 
                {" "}أو التركيز على <span className="creative-span" data-type="scale">بناء العضلات</span>, 
                {" "}<span className="creative-span" data-type="slide-in-rtl">نظامنا المتكامل</span> 
                {" "}يضمن أن <span className="creative-span" data-type="drop">أهدافك</span> 
                {" "}ستتحقق عبر <span className="creative-span" data-type="slide-in-ltr">متابعة دقيقة</span> 
                {" "}في بيئة <span className="creative-span" data-type="scale">احترافية تماماً</span>.
              </>
            )}
          />
        </div>

      {/* ======== SECTION 4: SCROLLING IMAGES WITH STICKY NUMBER ======== */}
      <div ref={addToRefs} dir="ltr">
        <ImagesArcAnimation />
      </div>

      {/* ======== SECTION 5: FUNDAMENTAL PILLARS (4 CARDS FIXED) ======== */}
      <div ref={addToRefs} dir="ltr">
        <FundamentalPillars 
          title="مميزات"
          highlightText="Infinity Gym"
          cardsData={[
            { id: '01', title: 'أجهزة حديثة ومتطورة', desc: 'نمتلك أحدث الأجهزة الرياضية المعتمدة عالمياً لضمان تجربة تمرين آمنة وفعالة تستهدف جميع عضلات الجسم بدقة.' },
            { id: '02', title: 'نخبة المدربين المحترفين', desc: 'يضم فريقنا مجموعة من أفضل المدربين المعتمدين لتوجيهك خطوة بخطوة وتقديم برامج تدريبية مخصصة تناسب أهدافك.' },
            { id: '03', title: 'برامج تغذية علمية', desc: 'لا يكتمل التدريب بدون تغذية سليمة. نوفر خطط وجبات ومكملات غذائية مبنية على أسس علمية لتسريع نتائجك.' },
            { id: '04', title: 'مجتمع رياضي داعم', desc: 'نوفر بيئة إيجابية مليئة بالطاقة والتحفيز تساعدك على الاستمرار وتحدي نفسك لتصل لأفضل نسخة منك.' }
          ]}
        />
      </div>

      <Footer />
    </div>
  );
};

export default Services;
