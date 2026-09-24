import React from 'react';
import { motion } from 'framer-motion';

export function GlowEffect({
  colors = ['#FF5733', '#33FF57', '#3357FF', '#F1C40F'],
  duration = 3,
  scale = 0.9,
}) {
  return (
    <motion.div
      style={{
        position: 'absolute',
        inset: '-5px', /* Expand slightly outside the button */
        zIndex: 0,
        filter: 'blur(20px)',
        transform: `scale(${scale})`,
        borderRadius: 'inherit',
        opacity: 0.7,
      }}
      animate={{
        backgroundColor: colors,
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        repeatType: 'mirror',
        ease: 'linear',
      }}
    />
  );
}

export function GlowButton({ children, className, glowColors, ...props }) {
  const defaultColors = ['#f29c38', '#f4c243', '#16a34a', '#0f2923'];
  const colorsToUse = glowColors || defaultColors;
  
  return (
    <div style={{ position: 'relative', display: 'inline-flex', borderRadius: '9999px' }}>
      <GlowEffect colors={colorsToUse} duration={4} scale={1.2} />
      <button className={`${className} relative`} style={{ zIndex: 10, background: 'var(--color-deep-green)' }} {...props}>
        {children}
      </button>
    </div>
  );
}
