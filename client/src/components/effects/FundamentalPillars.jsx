import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import './FundamentalPillars.css';

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

const pillarsData = [
  {
    id: '01',
    title: 'أجهزة حديثة ومتطورة',
    desc: 'نمتلك أحدث الأجهزة الرياضية المعتمدة عالمياً والمزودة بأحدث التقنيات لضمان تجربة تمرين آمنة وفعالة تستهدف جميع عضلات الجسم بدقة.'
  },
  {
    id: '02',
    title: 'نخبة المدربين المحترفين',
    desc: 'يضم فريقنا مجموعة من أفضل المدربين المعتمدين والمؤهلين لتوجيهك خطوة بخطوة، وتقديم برامج تدريبية مخصصة تناسب قدراتك وأهدافك.'
  },
  {
    id: '03',
    title: 'برامج تغذية علمية ومدروسة',
    desc: 'لا يكتمل التدريب بدون تغذية سليمة. نحن نوفر لك خطط وجبات ومكملات غذائية مبنية على أسس علمية لتسريع عملية البناء العضلي وحرق الدهون.'
  },
  {
    id: '04',
    title: 'مجتمع رياضي داعم ومحفز',
    desc: 'نحن لا نقدم مجرد مكان للتدريب، بل نوفر بيئة إيجابية مليئة بالطاقة والتحفيز تساعدك على الاستمرار وتحدي نفسك لتصل لأفضل نسخة منك.'
  }
];

export default function FundamentalPillars({ 
  title = "الأسس الرئيسية في", 
  highlightText = "Infinity Gym", 
  cardsData = pillarsData 
}) {
  const containerRef = useRef(null);
  const introRef = useRef(null);
  const trailRef = useRef(null);
  const airplaneRef = useRef(null);

  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      const ctx = gsap.context(() => {
        const trail = trailRef.current;
        const airplane = airplaneRef.current;

        if (trail && airplane && introRef.current && containerRef.current) {
          const length = trail.getTotalLength();
          const startPoint = trail.getPointAtLength(0);

          // Set initial position at path start
          gsap.set(airplane, {
            x: startPoint.x,
            y: startPoint.y,
            xPercent: -50,
            yPercent: -50,
            transformOrigin: '50% 50%'
          });

          gsap.set(trail, {
            strokeDasharray: length,
            strokeDashoffset: length,
            opacity: 1
          });

          // Find "matrix" word position in heading
          const svgEl = containerRef.current.querySelector('.pillar-airplane-svg');
          const headingEl = containerRef.current.querySelector('.section-title');
          let stopLength = length;
          let stopProgress = 1;

          if (svgEl && headingEl) {
            const svgRect = svgEl.getBoundingClientRect();
            const viewBox = svgEl.getAttribute('viewBox') || '0 0 1000 800';
            const [vbX, vbY, vbW, vbH] = viewBox.split(' ').map(Number);
            const headingText = headingEl.textContent;
            const matrixIndex = headingText.toLowerCase().indexOf('matrix');

            if (matrixIndex !== -1) {
              try {
                const range = document.createRange();
                const textNodes = [];
                const walker = document.createTreeWalker(
                  headingEl,
                  NodeFilter.SHOW_TEXT,
                  null,
                  false
                );
                let node;
                while (node = walker.nextNode()) {
                  textNodes.push(node);
                }

                let charCount = 0;
                let foundStart = false;
                let foundEnd = false;

                for (let textNode of textNodes) {
                  const nodeLength = textNode.textContent.length;
                  const nodeLower = textNode.textContent.toLowerCase();
                  const localMatrixIndex = nodeLower.indexOf('matrix');

                  if (localMatrixIndex !== -1 && !foundStart) {
                    range.setStart(textNode, localMatrixIndex);
                    range.setEnd(textNode, localMatrixIndex + 6); // "matrix" = 6 chars
                    foundStart = true;
                    foundEnd = true;
                    break;
                  }
                  charCount += nodeLength;
                }

                if (foundStart && foundEnd) {
                  const matrixRect = range.getBoundingClientRect();
                  const targetX = ((matrixRect.left + matrixRect.width / 2) - svgRect.left) * (vbW / svgRect.width) + vbX;
                  const targetY = ((matrixRect.top + matrixRect.height / 2) - svgRect.top) * (vbH / svgRect.height) + vbY;

                  // Precise sampling to find closest point to "matrix"
                  let best = { l: 0, d: Infinity };
                  const samples = Math.max(150, Math.floor(length / 5));
                  for (let i = 0; i <= samples; i++) {
                    const l = (i / samples) * length;
                    const p = trail.getPointAtLength(l);
                    const dx = p.x - targetX;
                    const dy = p.y - targetY;
                    const d = dx * dx + dy * dy;
                    if (d < best.d) { best = { l, d }; }
                  }
                  stopLength = best.l;
                  stopProgress = Math.min(1, stopLength / length);
                }
              } catch (e) {
                // Fallback
              }
            }
          }

          // Animate airplane along path but limit to stopProgress
          const planeTween = gsap.to(airplane, {
            motionPath: {
              path: trail,
              align: trail,
              alignOrigin: [0.5, 0.5],
              autoRotate: true
            },
            ease: 'none',
            duration: 1,
            paused: true
          });

          const trailTween = gsap.to(trail, {
            strokeDashoffset: 0,
            ease: 'none',
            duration: 1,
            paused: true
          });

          // Create scroll trigger that controls both animations but limits to stopProgress
          ScrollTrigger.create({
            trigger: introRef.current,
            start: 'top bottom',
            end: 'bottom top',
            onUpdate: (self) => {
              const limitedProgress = Math.min(stopProgress, self.progress);
              planeTween.progress(limitedProgress);
              trailTween.progress(limitedProgress);
            }
          });
        }
      }, containerRef);

      return () => ctx.revert();
    });

    return () => mm.revert();
  }, []);

  return (
    <div className="pillars-stack-container" ref={containerRef}>
      
      {/* Airplane Intro Section removed as requested */}

      <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '4rem', paddingTop: '4rem', position: 'relative', zIndex: 10 }}>
        {title} <span className="highlight">{highlightText}</span>
      </h2>
      
      <div className="pillars-cards-wrapper">
        {cardsData.map((pillar, index) => (
          <div 
            key={pillar.id} 
            className="pillar-stacked-card"
            style={{ 
              "--card-index": index,
              zIndex: index + 1
            }}
          >
            <div className="pillar-card-content">
              <div className="pillar-card-header">
                <span className="pillar-card-num">{pillar.id}</span>
                <h3 className="pillar-card-title">{pillar.title}</h3>
              </div>
              <div className="pillar-card-body">
                {typeof pillar.desc === 'string' ? <p>{pillar.desc}</p> : pillar.desc}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
