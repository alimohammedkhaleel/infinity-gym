import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ImageWithPlaceholder from '../common/ImageWithPlaceholder';
import './InfiniteMenu.css';

gsap.registerPlugin(ScrollTrigger);

export default function InfiniteMenu({ items, onItemClick, className = '' }) {
  const containerRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const isMobile = window.innerWidth <= 768;

    let ctx = gsap.context(() => {
      cardsRef.current.forEach((card, index) => {
        if (!card) return;

        const centerIndex = Math.floor(items.length / 2);
        const distanceFromCenter = index - centerIndex;

        const tiltAngle = distanceFromCenter * (isMobile ? 8 : 20);
        const finalX = distanceFromCenter * (isMobile ? 45 : 220);
        const finalY = Math.abs(distanceFromCenter) * (isMobile ? 15 : 50);

        // Initial state
        gsap.set(card, {
          opacity: 0,
          y: isMobile ? 80 : 150,
          x: 0,
          rotationZ: 0,
          transformOrigin: "bottom center",
          zIndex: items.length - Math.abs(distanceFromCenter)
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        });

        tl.to(card, {
          opacity: 1,
          y: 0,
          duration: 0.15,            // أسرع (كان 0.3)
          ease: "power1.out"
        })
          .to(card, {
            y: finalY,
            x: finalX,
            rotationZ: tiltAngle,
            duration: 0.35,            // أسرع (كان 0.7)
            ease: "power2.out"
          }, 0.1);                     // إضافة تأخير بسيط بين الحركتين
      });
    }, containerRef);

    return () => ctx.revert();
  }, [items]);

  return (
    <div className={`infinite-menu-horizontal ${className}`} ref={containerRef}>
      {items.map((item, index) => (
        <div
          key={index}
          className="infinite-menu-card-wrapper"
          ref={(el) => cardsRef.current[index] = el}
        >
          <div
            className="infinite-menu-card"
            onClick={() => onItemClick?.(item, index)}
            style={{ cursor: onItemClick ? 'pointer' : 'default' }}
          >
            <div className="infinite-menu-img-container">
              {item.image && (
                <ImageWithPlaceholder
                  src={item.image}
                  alt={item.label}
                  className="infinite-menu-img"
                  loading="lazy"
                  aspectRatio="1/1"
                />
              )}
            </div>
            <div className="infinite-menu-overlay">
              <div className="infinite-menu-label">{item.label}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}