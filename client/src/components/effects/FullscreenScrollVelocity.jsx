import React, { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { 
  Cpu, 
  Code2, 
  GraduationCap, 
  User, 
  Globe, 
  Layout,
  Terminal,
  Activity,
  Zap,
  Layers,
  Sparkles
} from 'lucide-react';
import './FullscreenScrollVelocity.css';

gsap.registerPlugin(ScrollTrigger);

export default function FullscreenScrollVelocity({
  badgeText = "مرحباً بك في Infinity Gym",
  titleLine1 = "تدريب",
  titleLine2 = "احترافي",
  subTitle = "قوة • سرعة • لياقة",
  description = "نقدم أفضل برامج اللياقة البدنية مع نخبة من المدربين المعتمدين وأحدث الأجهزة الرياضية لتحقيق نتائج استثنائية.",
  techPills = ["كارديو", "يوجا", "أوزان", "تدريب شخصي"],
  epicSentence = null
}) {
  const containerRef = useRef(null);
  const textWrapperRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const wrapper = textWrapperRef.current;
      if (!wrapper) return;

      // حساب العرض الكلي للمحتوى ديناميكياً
      const getAmountToScroll = () => wrapper.scrollWidth - window.innerWidth;

      const animatedElements = wrapper.querySelectorAll('.creative-span, .creative-icon');

      // تهيئة العناصر لتكون مخفية تماماً في البداية (Scale 0, Opacity 0)
      animatedElements.forEach(el => {
        gsap.set(el, { opacity: 0 });
      });

      const isMobile = window.innerWidth <= 768;

      if (isMobile) {
        // Mobile specific animations based on data-type
        animatedElements.forEach(el => {
          const type = el.dataset.type;
          
          let fromVars = { opacity: 0 };
          let toVars = { 
            opacity: 1, 
            duration: 0.8, 
            ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none reverse"
            }
          };

          if (type === "scale") {
            fromVars.scale = 0;
            toVars.scale = 1;
            toVars.color = "var(--primary-yellow)";
          } else if (type === "drop") {
            fromVars.y = -60;
            toVars.y = 0;
            toVars.color = "var(--yellow-300)";
          } else if (type === "slide-in-rtl") {
            fromVars.x = 100;
            toVars.x = 0;
            toVars.color = "var(--primary-yellow)";
          } else if (type === "slide-in-ltr") {
            fromVars.x = -100;
            toVars.x = 0;
            toVars.color = "var(--yellow-500)";
          } else if (type === "icon-float-up") {
            fromVars.y = 50;
            fromVars.x = -50;
            toVars.y = -20;
            toVars.x = 0;
            toVars.rotate = 15;
          } else if (type === "icon-float-down") {
            fromVars.y = -50;
            fromVars.x = 50;
            toVars.y = 20;
            toVars.x = 0;
            toVars.rotate = -15;
          } else {
            fromVars.y = 20;
            toVars.y = 0;
            toVars.color = "var(--primary-yellow)";
          }

          gsap.fromTo(el, fromVars, toVars);
        });
      } else {
        // Desktop horizontal scrolling and floating animation
        gsap.to(wrapper, {
          x: () => getAmountToScroll(), // Positive X for RTL layout
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            pin: true,
            scrub: 1.5, 
            start: "top top",
            end: () => `+=${getAmountToScroll()}`, 
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              animatedElements.forEach(el => {
                const type = el.dataset.type;
                const rect = el.getBoundingClientRect();
                const center = rect.left + (rect.width / 2);
                const viewportCenter = window.innerWidth / 2;
                
                let dist = (center - viewportCenter) / (window.innerWidth / 2);
                let p = 1 - Math.abs(dist);
                p = Math.max(0, Math.min(1, p));

                if (p > 0.4) {
                  if (type === "scale") gsap.to(el, { scale: 1, opacity: 1, color: "var(--primary-yellow)", duration: 0.15, overwrite: "auto" });
                  else if (type === "drop") gsap.to(el, { y: 0, opacity: 1, color: "var(--yellow-300)", duration: 0.15, overwrite: "auto" });
                  else if (type === "slide-in-rtl") gsap.to(el, { x: 0, opacity: 1, color: "var(--primary-yellow)", duration: 0.15, overwrite: "auto" });
                  else if (type === "slide-in-ltr") gsap.to(el, { x: 0, opacity: 1, color: "var(--yellow-500)", duration: 0.15, overwrite: "auto" });
                  else if (type === "icon-float-up") gsap.to(el, { y: -20, x: 0, opacity: 1, rotate: 15, duration: 0.15, overwrite: "auto" });
                  else if (type === "icon-float-down") gsap.to(el, { y: 20, x: 0, opacity: 1, rotate: -15, duration: 0.15, overwrite: "auto" });
                } else {
                  if (type === "scale") gsap.to(el, { scale: 0, opacity: 0, duration: 0.2, overwrite: "auto" });
                  else if (type === "drop") gsap.to(el, { y: -60, opacity: 0, duration: 0.2, overwrite: "auto" });
                  else if (type === "slide-in-rtl") gsap.to(el, { x: 100, opacity: 0, duration: 0.2, overwrite: "auto" });
                  else if (type === "slide-in-ltr") gsap.to(el, { x: -100, opacity: 0, duration: 0.2, overwrite: "auto" });
                  else if (type === "icon-float-up") gsap.to(el, { y: 0, x: -100, opacity: 0, rotate: 0, duration: 0.2, overwrite: "auto" });
                  else if (type === "icon-float-down") gsap.to(el, { y: 0, x: 100, opacity: 0, rotate: 0, duration: 0.2, overwrite: "auto" });
                }
              });
            }
          }
        });
      }
      
      // Force refresh after a short delay to ensure fonts and layout are fully calculated
      const timeoutId = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 500);
      
      return () => clearTimeout(timeoutId);

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="nctu-full-experience" dir="rtl">
      <div ref={textWrapperRef} className="horizontal-content-wrapper">

        {/* 1. السكشن الترحيبي */}
        <section className="nctu-hero-intro">
          
          {/* الأشكال الجمالية العائمة (3D Floating Shapes) */}
          <div className="hero-shapes">
            <div className="shape-dome"></div>
            <div className="shape-flower"></div>
            <div className="shape-ring"></div>
            <div className="shape-hourglass"></div>
            <div className="shape-diamond"></div>
          </div>

          <motion.div 
            className="hero-wrapper"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{ position: 'relative', zIndex: 10 }}
          >
            <div className="ready-badge">
              <span>{badgeText}</span>
            </div>

            <div className="title-block">
              <h1 className="main-title">
                <span className="text-white">{titleLine1}</span>
                <span style={{ color: "var(--primary-yellow)" }}>{titleLine2}</span>
              </h1>
              <p className="typewriter-sub">{subTitle}</p>
            </div>

            <p className="hero-desc">
              {description}
            </p>

            <div className="tech-pills">
              {techPills.map((tech) => (
                <div key={tech} className="tech-pill">{tech}</div>
              ))}
            </div>

            <div className="social-links-row">
              <a href="#" className="s-icon"><Globe size={18} /></a>
              <a href="#" className="s-icon"><User size={18} /></a>
              <a href="#" className="s-icon"><Terminal size={18} /></a>
            </div>
          </motion.div>
        </section>

        {/* 2. الجملة الطويلة ذات الكلمات المتحركة والأيقونات العائمة */}
        <section className="velocity-text-stream">
          <h2 className="epic-sentence">
            <span className="creative-icon" data-type="icon-float-up" style={{ top: '-15%', left: '10%' }}><Cpu size={50} color="var(--primary-yellow)"/></span>
            <span className="creative-icon" data-type="icon-float-down" style={{ bottom: '-15%', left: '35%' }}><Zap size={50} color="var(--yellow-300)"/></span>
            <span className="creative-icon" data-type="icon-float-up" style={{ top: '-20%', left: '60%' }}><Layers size={50} color="var(--primary-yellow)"/></span>
            <span className="creative-icon" data-type="icon-float-down" style={{ bottom: '-10%', left: '85%' }}><Sparkles size={50} color="var(--yellow-500)"/></span>

            {epicSentence ? epicSentence : (
              <>
                سواء كنت تهدف لـ <span className="creative-span" data-type="drop">تخسيس الوزن</span> 
                {" "}أو التركيز على <span className="creative-span" data-type="scale">بناء العضلات</span>, 
                {" "}<span className="creative-span" data-type="slide-in-rtl">نظامنا المتكامل</span> 
                {" "}يضمن أن <span className="creative-span" data-type="drop">أهدافك</span> 
                {" "}ستتحقق عبر <span className="creative-span" data-type="slide-in-ltr">متابعة دقيقة</span> 
                {" "}في بيئة <span className="creative-span" data-type="scale">احترافية تماماً</span>.
              </>
            )}
          </h2>
        </section>

      </div>
    </div>
  );
}