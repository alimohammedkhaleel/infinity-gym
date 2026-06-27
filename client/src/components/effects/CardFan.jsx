import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './CardFan.css';

gsap.registerPlugin(ScrollTrigger);

const cardData = [
  {
    id: 1,
    title: 'قسم الكارديو',
    role: 'حرق الدهون وبناء اللياقة',
    src: '/assets/cardio_training.png'
  },
  {
    id: 2,
    title: 'صالة الأوزان الحرة',
    role: 'بناء الكتلة العضلية',
    src: '/assets/weight_lifting.png'
  },
  {
    id: 3,
    title: 'التدريب الشخصي',
    role: 'متابعة فردية متخصصة',
    src: '/assets/personal_training.png'
  }
];

export default function CardFan() {
  const containerRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Create scroll triggered centered fanning spread
      gsap.fromTo(cardsRef.current,
        {
          x: 0,
          rotation: 0,
          transformOrigin: '50% 100%',
        },
        {
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%',
            end: 'top 30%',
            scrub: 1.5,
          },
          x: (i) => (i - 1) * 220, // Perfect symmetrical spread left and right
          rotation: (i) => (i - 1) * 12, // Beautiful fan angles
          duration: 1.5,
          ease: 'power2.out',
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="card-fan-container" ref={containerRef} dir="rtl">
      <h3 className="card-fan-subtitle">أقسام الجيم المتكاملة</h3>
      <h2 className="card-fan-title">مناطق التدريب في Infinity Gym</h2>
      <p className="card-fan-desc">
        قم بالتمرير للأسفل لرؤية كيف تتوزع أقسام التدريب المختلفة لدينا لتوفير بيئة رياضية متكاملة لجميع احتياجاتك.
      </p>
      
      <div className="card-fan-deck">
        {cardData.map((card, idx) => (
          <div
            key={card.id}
            className="fan-card"
            ref={(el) => (cardsRef.current[idx] = el)}
            style={{ zIndex: idx }}
          >
            <div className="fan-card-inner">
              <img src={card.src} alt={card.title} className="fan-card-img" />
              <div className="fan-card-overlay"></div>
              <div className="fan-card-content">
                <div className="fan-card-badge">0{card.id}</div>
                <h3>{card.title}</h3>
                <p>{card.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
