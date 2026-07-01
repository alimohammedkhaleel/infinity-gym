import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Heart, Phone, MapPin, Clock, Shield } from 'lucide-react';
import './Footer.css';

gsap.registerPlugin(ScrollTrigger);

const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const Footer = () => {
  const footerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.refresh();

      gsap.fromTo('.footer-grid > *',
        { y: 30, opacity: 0 },
        {
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 90%',
            toggleActions: 'play none none reverse',
          },
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out',
        }
      );

      gsap.fromTo('.footer-glow-line',
        { scaleX: 0, opacity: 0 },
        {
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 95%',
            toggleActions: 'play none none reverse',
          },
          scaleX: 1,
          opacity: 1,
          duration: 1.5,
          ease: 'power2.inOut',
        }
      );
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer className="premium-footer" ref={footerRef} dir="rtl">
      <div className="footer-glow-line" />
      <div className="footer-container">
        
        {/* Main Grid Content */}
        <div className="footer-grid">
          
          {/* Col 1: Brand & Management */}
          <div className="footer-col brand-col">
            <h3 className="footer-brand-title">INFINITY <span className="highlight-green">GYM</span></h3>
            <p className="footer-brand-desc">
              أفضل صالة ألعاب رياضية متكاملة في السويس بحي فيصل. نحن نسعى دائماً لتقديم أحدث الأجهزة والبرامج التدريبية المبتكرة لمساعدتك في بناء جسد مثالي وصحي.
            </p>
            <div className="management-badge">
              <Shield size={16} className="highlight-green" />
              <span>تحت قيادة وإشراف: <strong>الكابتن أحمد طه</strong></span>
            </div>
          </div>

          {/* Col 2: Quick Contact */}
          <div className="footer-col contact-col">
            <h4 className="col-title">📞 تواصل معنا</h4>
            <ul className="contact-list">
              <li>
                <a href="https://wa.me/201015000540" target="_blank" rel="noopener noreferrer" className="contact-link-item">
                  <Phone size={16} className="highlight-green" />
                  <span>01015000540 (واتساب)</span>
                </a>
              </li>
              <li>
                <a href="https://wa.me/201090070836" target="_blank" rel="noopener noreferrer" className="contact-link-item">
                  <Phone size={16} className="highlight-green" />
                  <span>01090070836 (واتساب)</span>
                </a>
              </li>
              <li>
                <a href="https://wa.me/201015000540" target="_blank" rel="noopener noreferrer" className="whatsapp-badge-link">
                  💬 راسلنا مباشرة عبر واتساب
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Address & Location */}
          <div className="footer-col location-col">
            <h4 className="col-title">📍 موقعنا</h4>
            <div className="location-detail">
              <MapPin size={18} className="highlight-green shrink-0" />
              <p>
                السويس، حي فيصل - السلام 1 – شارع عثمان بن عفان – خلف مدرسة اللغات الإسلامية – مول المروة
              </p>
            </div>
            <a
              href="https://maps.google.com/?q=Infinity+Gym+Suez+حي+فيصل+السويس"
              target="_blank"
              rel="noopener noreferrer"
              className="map-link-btn"
            >
              🗺️ اتجاهات خرائط جوجل
            </a>
          </div>

          {/* Col 4: Hours & Follow */}
          <div className="footer-col hours-col">
            <h4 className="col-title">🕐 مواعيد العمل</h4>
            <div className="hours-detail">
              <Clock size={16} className="highlight-green" />
              <span>مفتوح 24 ساعة طوال الأسبوع (24/7)</span>
            </div>
            
            <h4 className="col-title social-title">🌐 تابعنا على السوشيال ميديا</h4>
            <div className="footer-socials-grid">
              <a
                href="https://www.facebook.com/InfinityGym23/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn facebook"
                title="فيسبوك"
              >
                <FacebookIcon />
                <span>فيسبوك</span>
              </a>
              <a
                href="https://www.instagram.com/infinity_gym23/?hl=ar"
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn instagram"
                title="انستجرام"
              >
                <InstagramIcon />
                <span>انستجرام</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar with Developer & Copyright info */}
        <div className="footer-bottom-bar">
          <p className="copyright-text">
            © {new Date().getFullYear()} Infinity Gym Suez. جميع الحقوق محفوظة.
          </p>
          
          <div className="developer-credits">
            <p className="dev-para">
              تم التطوير بكل <Heart size={12} className="heart-icon" /> بواسطة{' '}
              <span className="dev-name-highlight">المطور/ علي محمد علي خليل</span>
            </p>
            <div className="dev-meta-links">
              <span className="dev-skill-tag">Full Stack React &amp; Express Developer</span>
              <a href="https://wa.me/201121360605" target="_blank" rel="noopener noreferrer" className="dev-tel-link">📞 01121360605 (واتساب)</a>
              <a
                href="https://www.tiktok.com/@zlolcoding?is_from_webapp=1&amp;sender_device=pc"
                target="_blank"
                rel="noopener noreferrer"
                className="dev-tiktok-link"
              >
                🎵 TikTok: zlolcoding
              </a>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
