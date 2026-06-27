import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ImageWithPlaceholder from '../common/ImageWithPlaceholder';
import './ImagesArcAnimation.css';

gsap.registerPlugin(ScrollTrigger);

const imagesData = [
  {
    id: 1,
    title: 'قسم الكارديو المتقدم',
    desc: 'أحدث المشايات، الأوربتراك، والدراجات الثابتة المجهزة بشاشات مدمجة لتتبع أدائك ومعدل الحرق في الوقت الفعلي.',
    src: '/assets/cardio_training.png'
  },
  {
    id: 2,
    title: 'صالة الأوزان الحرة',
    desc: 'تشكيلة واسعة من الأوزان الحرة، البارات الأولمبية، وأجهزة المقاومة المصممة لتمرين آمن وعالي الأداء لبناء العضلات.',
    src: '/assets/weight_lifting.png'
  },
  {
    id: 3,
    title: 'ستوديو اليوجا والاسترخاء',
    desc: 'مساحة هادئة ومخصصة للراحة النفسية والجسدية مع إضاءة محيطية، مثالية لجلسات الكلاسات الجماعية وتمارين التأمل.',
    src: '/assets/yoga_classes.png'
  },
  {
    id: 4,
    title: 'برامج التغذية المخصصة',
    desc: 'تدرب مع خبراء التغذية الرياضية لدينا لتصميم خطط وجبات صحية، وتوجيهات للمكملات الغذائية تتناسب مع أهدافك.',
    src: '/assets/nutrition.png'
  },
  {
    id: 5,
    title: 'التدريب الشخصي VIP',
    desc: 'احصل على تدريب شخصي 1-on-1 مع مدربين معتمدين لتحسين تقنياتك، وتخطي حدودك، وتحقيق أهدافك في وقت قياسي.',
    src: '/assets/personal_training.png'
  }
];

export default function ImagesArcAnimation({ data = imagesData }) {
  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const images = gsap.utils.toArray('.scroll-img-wrapper');

      images.forEach((img, i) => {
        ScrollTrigger.create({
          trigger: img,
          start: 'top center',
          end: 'bottom center',
          onEnter: () => setActiveIndex(i),
          onEnterBack: () => setActiveIndex(i),
        });
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    gsap.fromTo('.arc-left-number',
      { scale: 0.8, opacity: 0, y: 20 },
      { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
    );
    gsap.fromTo('.arc-left-text-animate',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: 'power2.out' }
    );
  }, [activeIndex]);

  return (
    <div className="images-scroll-section" ref={containerRef}>
      <div className="arc-grid">
        
        {/* Left Column - Sticky Number and Description */}
        <div className="arc-left-col">
          <div className="arc-left-number" key={`num-${activeIndex}`}>
            0{data[activeIndex].id}
          </div>
          <div className="arc-left-content" key={`text-${activeIndex}`}>
            <h3 className="arc-left-text-animate arc-label">خدمات الجيم</h3>
            <h2 className="arc-left-text-animate arc-title">
              {data[activeIndex].title}
            </h2>
            <p className="arc-left-text-animate arc-desc">
              {data[activeIndex].desc}
            </p>
          </div>
        </div>

        {/* Right Column - Scrolling Images */}
        <div className="arc-right-col">
          {data.map((img) => (
            <div key={img.id} className="scroll-img-wrapper-outer">
              <div className="scroll-img-wrapper">
                <ImageWithPlaceholder
                  src={img.src}
                  alt={img.title}
                  className="scroll-img"
                  loading="lazy"
                  aspectRatio="4/3"
                />
              </div>
              <div className="mobile-img-info">
                <div className="mobile-img-num">0{img.id}</div>
                <h3 className="mobile-img-title">{img.title}</h3>
                <p className="mobile-img-desc">{img.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}