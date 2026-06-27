import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * CircularTimer — shows remaining days of subscription as a circular progress bar.
 * Turns red and pulses when < 3 days remaining.
 */
const CircularTimer = ({ totalDays, remainingDays }) => {
  const size = 180;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const progress = totalDays > 0 ? remainingDays / totalDays : 0;
  const strokeDashoffset = circumference * (1 - progress);

  const isWarning = remainingDays <= 3;
  const isExpired = remainingDays <= 0;

  const color = isExpired ? '#ff2244' : isWarning ? '#ff4444' : '#39ff14';
  const glowColor = isExpired ? 'rgba(255,34,68,0.7)' : isWarning ? 'rgba(255,68,68,0.7)' : 'rgba(57,255,20,0.7)';

  return (
    <motion.div
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      // Pulse animation when warning
      animate={isWarning ? {
        filter: [
          `drop-shadow(0 0 8px ${glowColor})`,
          `drop-shadow(0 0 20px ${glowColor})`,
          `drop-shadow(0 0 8px ${glowColor})`
        ]
      } : {
        filter: `drop-shadow(0 0 12px ${glowColor})`
      }}
      transition={{ repeat: isWarning ? Infinity : 0, duration: 1.2, ease: 'easeInOut' }}
    >
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
        />
      </svg>

      {/* Center Text */}
      <div style={{
        position: 'absolute',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <span style={{
          fontSize: '2.4rem',
          fontWeight: '900',
          color: color,
          lineHeight: 1,
          fontFamily: 'Outfit, sans-serif'
        }}>
          {isExpired ? '0' : remainingDays}
        </span>
        <span style={{
          fontSize: '0.7rem',
          color: '#888',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          marginTop: '4px'
        }}>
          {isExpired ? 'EXPIRED' : 'Days Left'}
        </span>
      </div>
    </motion.div>
  );
};

export default CircularTimer;
