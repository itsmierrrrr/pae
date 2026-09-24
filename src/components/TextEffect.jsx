import React from 'react';
import { motion } from 'framer-motion';

export function TextEffect({
  children,
  per = 'word',
  preset = 'fade',
  className = '',
}) {
  if (typeof children !== 'string') {
    return <div className={className}>{children}</div>;
  }

  const textArray = per === 'char' ? children.split('') : children.split(' ');

  const variants = {
    fade: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.3 } },
    },
    slide: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    },
    blur: {
      hidden: { opacity: 0, filter: 'blur(8px)' },
      visible: { opacity: 1, filter: 'blur(0px)', transition: { duration: 0.5 } },
    }
  };

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: per === 'char' ? 0.02 : 0.08,
      },
    },
  };

  const childVariant = variants[preset] || variants.fade;

  return (
    <motion.div
      className={className}
      variants={container}
      initial="hidden"
      animate="visible"
      style={{ display: 'inline-block' }}
    >
      {textArray.map((item, index) => (
        <motion.span
          key={index}
          variants={childVariant}
          style={{ 
            display: 'inline-block', 
            whiteSpace: per === 'char' && item === ' ' ? 'pre' : 'normal',
            marginRight: per === 'word' && index < textArray.length - 1 ? '0.25em' : '0'
          }}
        >
          {item}
        </motion.span>
      ))}
    </motion.div>
  );
}
