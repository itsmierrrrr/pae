import React from 'react';
import { ArrowRight } from 'lucide-react';
import { AnimatedBackground } from './AnimatedBackground';

export default function Footer() {
  const FOOTER_LINKS = ['Twitter', 'LinkedIn', 'Privacy', 'Terms'];
  return (
    <footer className="footer">
      <div className="footer-top">
        <h2>
          Same craft.<br />
          <span>Bigger world.</span>
        </h2>
        <button className="btn-accent" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          Stop filling spreadsheets <ArrowRight size={16} />
        </button>
      </div>
      <div className="footer-bottom">
        <div>Empowering artisan makers across global marketplaces. PА © 2026</div>
        <AnimatedBackground
          enableHover
          layoutId="footer-animated-bg"
          activeColor="rgba(255, 255, 255, 0.1)"
          style={{ display: 'flex', gap: '24px', alignItems: 'center' }}
          transition={{ type: 'spring', bounce: 0.2, duration: 0.3 }}
        >
          {FOOTER_LINKS.map((link, idx) => (
            <a 
              key={idx} 
              data-id={link} 
              href="#" 
              style={{ 
                display: 'inline-block',
                padding: '4px 12px',
                color: 'inherit', 
                textDecoration: 'none'
              }}
            >
              {link}
            </a>
          ))}
        </AnimatedBackground>
      </div>
    </footer>
  );
}
