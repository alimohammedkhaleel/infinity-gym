import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Heart, Phone } from 'lucide-react';
import './Footer.css';

gsap.registerPlugin(ScrollTrigger);

const Footer = () => {
  const footerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.refresh();

      gsap.fromTo('.footer-content > *',
        { y: 30, opacity: 0, scale: 0.95 },
        {
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top 95%",
            toggleActions: "play none none reverse",
          },
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out"
        }
      );

      gsap.fromTo('.footer-glow-line',
        { scaleX: 0, opacity: 0 },
        {
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top 95%",
            toggleActions: "play none none reverse",
          },
          scaleX: 1,
          opacity: 1,
          duration: 1.5,
          ease: "power2.inOut"
        }
      );
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer className="simple-footer" ref={footerRef} dir="rtl">
      <div className="footer-glow-line"></div>
      <div className="footer-content">
        <h3 className="footer-title">INFINITY <span className="highlight-green">GYM</span></h3>
        <p className="footer-tagline">أفضل صالة ألعاب رياضية متكاملة في السويس - حي فيصل</p>
        
        {/* روابط سريعة */}
        <div className="footer-socials">
          <a href="https://www.facebook.com/InfinityGym23/" target="_blank" rel="noopener noreferrer" className="social-link" title="فيسبوك">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            <span>فيسبوك</span>
          </a>
          <a href="https://www.instagram.com/infinity_gym23/?hl=ar" target="_blank" rel="noopener noreferrer" className="social-link" title="انستجرام">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            <span>انستجرام</span>
          </a>
        </div>

        {/* معلومات المطور */}
        <div className="developer-info">
          <p className="dev-text">
            تم التطوير بكل <Heart size={14} className="heart-icon" /> بواسطة{' '}
            <span className="dev-name">المطور/ علي محمد علي خليل</span>
          </p>
          <div className="dev-badges">
            <span className="dev-badge">React &amp; Express Developer</span>
            <span className="dev-badge">Full Stack</span>
          </div>
          <div className="dev-contacts">
            <a href="tel:+201121360605" className="dev-contact-item">
              <Phone size={14} />
              <span>01121360605</span>
            </a>
            <a href="https://www.tiktok.com/@z_lolcoding" target="_blank" rel="noopener noreferrer" className="dev-contact-item tiktok-link">
              <span>🎵 TikTok: z_lolcoding</span>
            </a>
          </div>
        </div>

        <p className="copyright">
          © {new Date().getFullYear()} Infinity Gym Suez. جميع الحقوق محفوظة.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
