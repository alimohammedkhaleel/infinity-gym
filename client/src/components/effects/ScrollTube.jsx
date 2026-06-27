import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import './ScrollTube.css';

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

const ScrollTube = () => {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const ball1Ref = useRef(null);
  const ball2Ref = useRef(null);
  const holeTopRef = useRef(null);
  const holeBottomRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const pathEl = svgRef.current?.querySelector('#wormPath');
      if (!pathEl) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 60%",
          end: "+=150%",
          scrub: 1.5,
          invalidateOnRefresh: true,
        }
      });

      // 1. Top hole appears
      tl.fromTo(holeTopRef.current,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.2, ease: "back.out(2)" },
        "0"
      );

      // 2. Ball 1 drops from top hole to tube
      tl.fromTo(ball1Ref.current,
        { opacity: 0, x: 400, y: 40, scale: 0.5 },
        { opacity: 1, x: 400, y: 120, scale: 1, duration: 0.4, ease: "power2.in" },
        "0.2"
      );

      // 3. Top hole disappears
      tl.to(holeTopRef.current, { scale: 0, opacity: 0, duration: 0.2 }, "0.4");

      // 4. Ball 1 travels path
      tl.to(ball1Ref.current, {
        motionPath: {
          path: pathEl,
          align: pathEl,
          alignOrigin: [0.5, 0.5],
          autoRotate: false,
        },
        duration: 3,
        ease: "power1.inOut"
      }, "0.6");

      // 5. While Ball 1 is traveling, Top hole reappears for Ball 2
      tl.to(holeTopRef.current, { scale: 1, opacity: 1, duration: 0.2, ease: "back.out(2)" }, "1.4");

      // 6. Ball 2 drops
      tl.fromTo(ball2Ref.current,
        { opacity: 0, x: 400, y: 40, scale: 0.5 },
        { opacity: 1, x: 400, y: 120, scale: 1, duration: 0.4, ease: "power2.in" },
        "1.6"
      );

      // 7. Top hole disappears again
      tl.to(holeTopRef.current, { scale: 0, opacity: 0, duration: 0.2 }, "1.8");

      // 8. Ball 2 travels
      tl.to(ball2Ref.current, {
        motionPath: {
          path: pathEl,
          align: pathEl,
          alignOrigin: [0.5, 0.5],
          autoRotate: false,
        },
        duration: 3,
        ease: "power1.inOut"
      }, "2.0");

      // 9. Bottom hole appears for Ball 1
      tl.to(holeBottomRef.current, { scale: 1, opacity: 1, duration: 0.2, ease: "back.out(2)" }, "3.4");

      // 10. Ball 1 drops into bottom hole
      tl.to(ball1Ref.current, {
        y: 640,
        opacity: 0,
        scale: 0.5,
        duration: 0.4,
        ease: "power2.in"
      }, "3.6");

      // 11. Bottom hole disappears after Ball 1
      tl.to(holeBottomRef.current, { scale: 0, opacity: 0, duration: 0.2 }, "4.0");

      // 12. Bottom hole appears for Ball 2
      tl.to(holeBottomRef.current, { scale: 1, opacity: 1, duration: 0.2, ease: "back.out(2)" }, "4.8");

      // 13. Ball 2 drops into bottom hole
      tl.to(ball2Ref.current, {
        y: 640,
        opacity: 0,
        scale: 0.5,
        duration: 0.4,
        ease: "power2.in"
      }, "5.0");

      // 14. Bottom hole disappears after Ball 2
      tl.to(holeBottomRef.current, { scale: 0, opacity: 0, duration: 0.2 }, "5.4");

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="scroll-tube-container" ref={containerRef}>
      <div className="scroll-tube-wrapper">
        
        {/* Top Hole */}
        <div className="st-hole st-hole-top" ref={holeTopRef}></div>

        {/* SVG Tube */}
        <svg 
          ref={svgRef}
          className="st-tube-svg" 
          viewBox="0 0 500 700" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Gradients and Filters */}
          <defs>
            <filter id="tube3D" x="-20%" y="-20%" width="140%" height="140%">
              {/* 1. Drop shadow for depth */}
              <feDropShadow dx="0" dy="15" stdDeviation="15" floodColor="#000000" floodOpacity="0.5" result="dropShadow"/>

              {/* 2. Yellow Inner Shadow (Bottom-Right edge) */}
              <feOffset in="SourceAlpha" dx="-10" dy="-15" result="offsetAlphaYellow" />
              <feGaussianBlur in="offsetAlphaYellow" stdDeviation="15" result="blurYellow" />
              <feComposite operator="out" in="SourceAlpha" in2="blurYellow" result="inverseYellow" />
              <feFlood floodColor="#fde047" floodOpacity="1" result="colorYellow" />
              <feComposite operator="in" in="colorYellow" in2="inverseYellow" result="shadowYellow" />

              {/* 3. Merge layers */}
              <feMerge>
                <feMergeNode in="dropShadow" />
                <feMergeNode in="SourceGraphic" />
                <feMergeNode in="shadowYellow" />
              </feMerge>
            </filter>
          </defs>

          {/* Single 3D Tube Path */}
          <path 
            d="M 400 120 L 400 160 A 50 50 0 0 1 350 210 L 150 210 A 60 60 0 0 0 150 330 L 350 330 A 60 60 0 0 1 350 450 L 150 450 A 50 50 0 0 0 100 500 L 100 560"
            stroke="#39ff14"
            strokeWidth="70"
            strokeLinecap="round"
            fill="none"
            filter="url(#tube3D)"
          />

          {/* Invisible motion path line for the balls */}
          <path 
            id="wormPath"
            d="M 400 120 L 400 160 A 50 50 0 0 1 350 210 L 150 210 A 60 60 0 0 0 150 330 L 350 330 A 60 60 0 0 1 350 450 L 150 450 A 50 50 0 0 0 100 500 L 100 560"
            stroke="none"
            strokeWidth="1"
            fill="none"
          />
        </svg>

        {/* Ball 1 */}
        <div className="st-ball st-ball-1" ref={ball1Ref}></div>

        {/* Ball 2 */}
        <div className="st-ball st-ball-2" ref={ball2Ref}></div>

        {/* Bottom Hole */}
        <div className="st-hole st-hole-bottom" ref={holeBottomRef}></div>
      </div>
    </div>
  );
};

export default ScrollTube;
