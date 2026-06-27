import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Dumbbell } from 'lucide-react';
import './Presentation.css';

const Presentation = ({ onFinish }) => {
  const pathRef = useRef(null);
  const [showText, setShowText] = useState(false);
  const letterRef = useRef(null);
  const dumbbellRef = useRef(null);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;

    // Get the length of the SVG path
    const length = path.getTotalLength();
    
    // Set initial dash array and offset to hide the path
    gsap.set(path, {
      strokeDasharray: length,
      strokeDashoffset: length,
    });

    const tl = gsap.timeline();

    // 1. Paint the background (Vertical zigzag brush wipe)
    tl.to(path, {
      strokeDashoffset: 0,
      duration: 2.5,
      ease: 'power2.inOut',
      onComplete: () => setShowText(true)
    });

  }, []);

  useEffect(() => {
    if (showText && letterRef.current && dumbbellRef.current) {
      // Animate the text container popping in
      gsap.fromTo('.text-container', 
        { opacity: 0, scale: 0.8 }, 
        { opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.5)' }
      );

      // Animate the dumbbell falling and letter 'i' squishing
      const tl = gsap.timeline();
      
      tl.fromTo(dumbbellRef.current, 
        { y: -300, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'bounce.out', delay: 0.8 }
      )
      .to(letterRef.current, {
        scaleY: 0.1, y: 20, opacity: 0, duration: 0.2, ease: 'power2.in'
      }, "-=0.3") // Squish the letter as dumbbell hits
      .to('.fall-letter', {
        y: () => gsap.utils.random(600, 1000),
        rotation: () => gsap.utils.random(-90, 90),
        opacity: 0,
        stagger: 0.05,
        duration: 0.8,
        ease: 'power2.in'
      }, "+=1.2") // Letters break and fall
      .to(dumbbellRef.current, {
        y: 800,
        rotation: 45,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.in'
      }, "<")
      .to({}, {
        duration: 0.5,
        onComplete: () => {
          // Unpaint the background after text falls
          setShowText(false);
          if (pathRef.current) {
            const length = pathRef.current.getTotalLength();
            gsap.to(pathRef.current, {
              strokeDashoffset: length,
              duration: 1.5,
              ease: 'power2.inOut',
              onComplete: () => {
                if (onFinish) onFinish();
              }
            });
          }
        }
      });
    }
  }, [showText, onFinish]);

  const renderLetters = (word) => {
    return word.split('').map((char, index) => (
      <span key={index} className="fall-letter" style={{ display: 'inline-block' }}>
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));
  };

  return (
    <div className="presentation-container">
      {/* The SVG element covering the screen for vertical paint brush wipe */}
      <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 1920 1080" 
        preserveAspectRatio="xMidYMid slice" 
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
      >
        <defs>
          <mask id="brushMask">
            {/* Vertical zigzag paint brush stroke */}
            <path
              ref={pathRef}
              d="M 100 -200 L -100 1280 L 400 -200 L 200 1280 L 700 -200 L 500 1280 L 1000 -200 L 800 1280 L 1300 -200 L 1100 1280 L 1600 -200 L 1400 1280 L 1900 -200 L 1700 1280 L 2200 -200 L 2000 1280"
              fill="none"
              stroke="white"
              strokeWidth="450"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </mask>
        </defs>
        <rect x="-20%" y="-20%" width="140%" height="140%" fill="#39ff14" mask="url(#brushMask)" />
      </svg>

      {showText && (
        <div className="text-container" style={{ opacity: 0 }}>
          <h1 className="gym-title">
            {renderLetters("Inf")}
            <span style={{ display: 'inline-block', position: 'relative' }}>
              <span ref={letterRef} style={{ display: 'inline-block', transformOrigin: 'bottom center' }}>i</span>
              <span 
                ref={dumbbellRef} 
                style={{ 
                  position: 'absolute', 
                  left: '50%', 
                  top: '50%', 
                  transform: 'translate(-50%, -50%)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#000',
                  opacity: 0
                }}
              >
                <span className="dumbbell-icon">
                  <Dumbbell size={65} style={{ transform: 'rotate(-45deg)' }} />
                </span>
              </span>
            </span>
            {renderLetters("nity Gym")}
          </h1>
        </div>
      )}
    </div>
  );
};

export default Presentation;
