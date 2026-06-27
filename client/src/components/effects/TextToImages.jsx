import React, { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './TextToImages.css';

gsap.registerPlugin(ScrollTrigger);

export default function TextToImages() {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const leftImageRef = useRef(null);
  const rightImageRef = useRef(null);

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=150%", // How long to pin and scroll
          scrub: 1.5,
          pin: true,
          pinSpacing: false,
        }
      });

      // Text fades out
      tl.to(textRef.current, {
        opacity: 0,
        y: -50,
        scale: 0.8,
        duration: 1,
        ease: "power2.inOut"
      });

      // Images slide in from left and right
      tl.fromTo(leftImageRef.current, 
        { x: "-100vw", opacity: 0, rotation: -10 },
        { x: 0, opacity: 1, rotation: -5, duration: 1.5, ease: "power2.out" },
        "<" // start at the same time as text fade
      );

      tl.fromTo(rightImageRef.current, 
        { x: "100vw", opacity: 0, rotation: 10 },
        { x: 0, opacity: 1, rotation: 5, duration: 1.5, ease: "power2.out" },
        "<" // start at the same time
      );

      // Slight hover/float effect as they settle
      tl.to([leftImageRef.current, rightImageRef.current], {
        y: -10,
        duration: 0.5,
        ease: "sine.inOut"
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="tti-container" ref={containerRef}>
      <div className="tti-text" ref={textRef}>
        <h2>تدريب يتخطى الحدود</h2>
        <p>نصنع الفارق من خلال برامجنا المصممة خصيصاً لتناسب أهدافك وطموحاتك.</p>
      </div>

      <div className="tti-images-wrapper">
        <img 
          src="/assets/yoga_classes.png" 
          alt="Yoga Training" 
          className="tti-img tti-left" 
          ref={leftImageRef}
        />
        <img 
          src="/assets/weight_lifting.png" 
          alt="Weight Lifting" 
          className="tti-img tti-right" 
          ref={rightImageRef}
        />
      </div>
    </div>
  );
}
