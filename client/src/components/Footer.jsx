import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Heart, Phone, Facebook, Instagram } from 'lucide-react';
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
            <Facebook size={20} />
            <span>فيسبوك</span>
          </a>
          <a href="https://www.instagram.com/infinity_gym23/?hl=ar" target="_blank" rel="noopener noreferrer" className="social-link" title="انستجرام">
            <Instagram size={20} />
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
