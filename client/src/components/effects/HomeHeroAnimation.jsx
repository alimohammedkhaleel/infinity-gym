import React, { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './HomeHeroAnimation.css';

gsap.registerPlugin(ScrollTrigger);

import captinImage from '../../assets/captin ahmed taha green.png';
import imgCopy2 from '../../assets/image copy 2.png';
import imgCopy3 from '../../assets/image copy 3.png';
import imgCopy6 from '../../assets/image copy 6.png';
import imgCopy7 from '../../assets/image copy 7.png';

export default function HomeHeroAnimation() {
  const containerRef = useRef(null);
  const mainImageRef = useRef(null);
  const textWrapperRef = useRef(null);
  const cornerImagesRef = useRef([]);

  // Texts
  const title1 = "INFINITY GYM";
  const title2 = "UNDER THE SUPERVISION OF CAPTAIN AHMED TAHA";

  // Images
  const mainImage = captinImage;
  const cornerImages = [
    imgCopy2,
    imgCopy3,
    imgCopy6,
    imgCopy7
  ];

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=300%", // pin for a long distance
          scrub: 1.5, // smooth scrubbing
          pin: true,
        }
      });

      // 1. Text reveals from top to bottom
      const letters = textWrapperRef.current.querySelectorAll('.hero-letter');
      tl.fromTo(letters, 
        { y: -100, opacity: 0 },
        { y: 0, opacity: 1, duration: 2, stagger: 0.05, ease: 'bounce.out' }
      );

      // 2. Shrink main image and place in center
      // It starts at 100vw, 100vh
      tl.to(mainImageRef.current, {
        width: "50vw", // wider than others
        height: "70vh", // taller than others
        borderRadius: "20px",
        duration: 2,
        ease: "power2.inOut"
      }, "+=0.5");

      // 3. Show corner images
      cornerImagesRef.current.forEach((img, idx) => {
        // Based on index: 0: top-left, 1: top-right, 2: bottom-left, 3: bottom-right
        let xOffset = idx % 2 === 0 ? "-100vw" : "100vw";
        let yOffset = idx < 2 ? "-100vh" : "100vh";
        
        tl.fromTo(img, 
          { x: xOffset, y: yOffset, opacity: 0, scale: 0, rotation: idx % 2 === 0 ? -15 : 15 },
          { x: 0, y: 0, opacity: 1, scale: 1, rotation: 0, duration: 2, ease: "power2.out" },
          "<" // Animate simultaneously with the main image shrinking
        );
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="home-hero-container" ref={containerRef}>
      <img 
        src={mainImage} 
        alt="Infinity Gym Main" 
        className="home-hero-main-image"
        ref={mainImageRef}
      />
      <div className="home-hero-overlay"></div>
      
      <div className="home-hero-text-wrapper" ref={textWrapperRef} dir="ltr">
        <h1 className="home-hero-title1">
          {title1.split('').map((char, i) => (
            <span key={`t1-${i}`} className="hero-letter">{char === ' ' ? '\u00A0' : char}</span>
          ))}
        </h1>
        <h2 className="home-hero-title2">
          {title2.split('').map((char, i) => (
            <span key={`t2-${i}`} className="hero-letter">{char === ' ' ? '\u00A0' : char}</span>
          ))}
        </h2>
      </div>

      {cornerImages.map((src, idx) => (
        <img 
          key={idx}
          src={src}
          alt={`Corner ${idx}`}
          className={`home-hero-corner-image pos-${idx}`}
          ref={el => cornerImagesRef.current[idx] = el}
        />
      ))}
    </div>
  );
}
