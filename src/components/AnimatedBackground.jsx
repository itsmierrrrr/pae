import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function AnimatedBackground({
  children,
  defaultValue,
  className,
  style = { display: 'flex', gap: '8px' },
  transition,
  enableHover,
  activeColor = 'var(--color-light-green)',
  layoutId = 'animated-background',
}) {
  const [activeId, setActiveId] = useState(defaultValue);

  return (
    <div className={className} style={style}>
      <AnimatePresence>
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return child;
          const id = child.props['data-id'];
          const isActive = activeId === id;

          return (
            <div
              style={{ position: 'relative' }}
              onMouseEnter={enableHover ? () => setActiveId(id) : undefined}
              onMouseLeave={enableHover ? () => setActiveId(defaultValue) : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId={layoutId}
                  transition={transition}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: activeColor,
                    borderRadius: '8px',
                    zIndex: 0,
                  }}
                />
              )}
              <div style={{ position: 'relative', zIndex: 1 }}>
                {child}
              </div>
            </div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
