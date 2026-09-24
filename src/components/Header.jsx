import React from 'react';
import { AnimatedBackground } from './AnimatedBackground';
import { GlowButton } from './GlowButton';

export default function Header() {
  const TABS = [
    { name: 'How it works', href: '#demo' },
    { name: 'Adaptive Market', href: '#adaptive' },
    { name: 'Voice Interview', href: '#voice' },
  ];

  return (
    <header 
      className="header" 
      data-scroll 
      data-scroll-sticky 
      data-scroll-target="#main-scroll-container"
      style={{ zIndex: 100 }}
    >
      <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontWeight: 700 }}>PА</span>
        <span style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6b7280' }}>
          of the artisans.
        </span>
      </div>

      <AnimatedBackground
        defaultValue={TABS[0].name}
        layoutId="nav-animated-bg"
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '4px',
          background: '#f4f4f5',
          borderRadius: '10px',
          padding: '4px',
        }}
        transition={{ type: 'spring', bounce: 0.2, duration: 0.3 }}
        activeColor="#ffffff"
        enableHover
      >
        {TABS.map((tab, index) => (
          <a
            key={index}
            data-id={tab.name}
            href={tab.href}
            style={{
              display: 'inline-block',
              padding: '6px 16px',
              textDecoration: 'none',
              color: '#52525b',
              fontWeight: 500,
              fontSize: '14px',
              borderRadius: '7px',
              transition: 'color 0.3s',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.name}
          </a>
        ))}
      </AnimatedBackground>

      <GlowButton className="btn-primary">Get Early Access</GlowButton>
    </header>
  );
}
