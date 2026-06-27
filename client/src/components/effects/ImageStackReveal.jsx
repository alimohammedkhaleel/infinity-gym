import React, { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './ImageStackReveal.css';

gsap.registerPlugin(ScrollTrigger);

export default function ImageStackReveal() {
  const containerRef = useRef(null);
  const imagesRef = useRef([]);

  const addToRefs = (el) => {
    if (el && !imagesRef.current.includes(el)) {
      imagesRef.current.push(el);
    }
  };

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      // Pin the section and animate images appearing one by one
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=200%", // pin for 2 screens
          scrub: 1.5,
          pin: true,
        }
      });

      // Images start invisible and scaled down
      gsap.set(imagesRef.current, { opacity: 0, scale: 0.5, y: 100 });

      // Animate them sequentially
      tl.to(imagesRef.current, {
        opacity: 1,
        scale: 1,
        y: 0,
        stagger: 0.5,
        duration: 1,
        ease: "back.out(1.5)"
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="isr-container" ref={containerRef}>
      <div className="isr-text-center">
        <h2 className="isr-title">رحلة التغيير تبدأ هنا</h2>
        <p className="isr-desc">
          كل تفصيلة في تدريبك محسوبة. نظام متكامل يجمع بين القوة، التحمل، التغذية والمتابعة اللحظية.
        </p>
      </div>

      <div className="isr-images">
        <img src="/assets/personal_training.png" className="isr-img isr-pos-1" ref={addToRefs} alt="Training 1" />
        <img src="/assets/nutrition.png" className="isr-img isr-pos-2" ref={addToRefs} alt="Training 2" />
        <img src="/assets/cardio_training.png" className="isr-img isr-pos-3" ref={addToRefs} alt="Training 3" />
        <img src="/assets/weight_lifting.png" className="isr-img isr-pos-4" ref={addToRefs} alt="Training 4" />
      </div>
    </div>
  );
}
