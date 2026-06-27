import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Footer.css';

gsap.registerPlugin(ScrollTrigger);

const Footer = () => {
  const footerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Refresh ScrollTrigger to ensure footer metrics are accurate after dynamic content loads
      ScrollTrigger.refresh();

      // Creative reveal of footer content on scroll
      // IMPORTANT: Start with opacity: 1 to ensure text is visible by default
      gsap.fromTo('.footer-content > *',
        { y: 50, opacity: 1, scale: 0.95 },
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
          stagger: 0.15,
          ease: "power3.out"
        }
      );

      // Glowing line expanding animation
      // Start with scaleX: 1 to ensure line is visible by default
      gsap.fromTo('.footer-glow-line',
        { scaleX: 1, opacity: 1 },
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
    <footer className="simple-footer" ref={footerRef}>
      <div className="footer-glow-line"></div>
      <div className="footer-content">
        <h3>VPN احترافي</h3>
        <p>الشبكة القومية الموحدة للجامعات التكنولوجية بمصر | National Unified VPN Framework</p>
        <p className="copyright">© {new Date().getFullYear()} NCTU. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
