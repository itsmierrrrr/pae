import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { TextEffect } from './TextEffect';
import { GlowButton } from './GlowButton';

export default function Hero() {
  return (
    <>
      <section className="section-padding hero-section">
        <div className="hero-content">
          <h1>
            PА for artisan makers.<br />
            <span>Bamboo storage basket, ready for every market.</span>
          </h1>
          <p style={{ minHeight: '80px' }}>
            <TextEffect per='char' preset='fade'>
              Turn one artisan product story into a complete product passport, packaged and ready for marketplaces, buyers, and global selling channels.
            </TextEffect>
          </p>
          <div className="hero-actions">
            <GlowButton className="btn-primary">See how it works</GlowButton>
            <button className="btn-secondary">Read the documentation</button>
          </div>
          <p style={{ marginTop: '24px', fontSize: '14px', color: 'var(--text-muted)' }}>
            <CheckCircle2 size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }} />
            Built to preserve craft, authenticity, and market-ready product data.
          </p>
        </div>
        
        <div className="hero-image-container glass-card" data-scroll data-scroll-speed="1.5">
          {/* Decorative element representing a product being translated */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', width: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 'bold' }}>PА PRODUCT PASSPORT</span>
                <span style={{ background: '#fef08a', color: '#854d0e', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>Ready for Amazon</span>
             </div>
             <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>Bamboo Storage Basket</h3>
             <div style={{ display: 'flex', gap: '16px' }}>
               <div style={{ width: '120px', height: '120px', background: '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <div style={{ width: '60px', height: '16px', background: '#d1d5db', borderRadius: '4px' }}></div>
               </div>
               <div style={{ flex: 1 }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px', marginBottom: '8px' }}>
                   <span style={{ fontSize: '12px', color: '#6b7280' }}>Dimensions</span>
                   <span style={{ fontSize: '12px', fontWeight: '600' }}>600 x 400</span>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px', marginBottom: '8px' }}>
                   <span style={{ fontSize: '12px', color: '#6b7280' }}>Material</span>
                   <span style={{ fontSize: '12px', fontWeight: '600' }}>100% Bamboo</span>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                   <span style={{ fontSize: '12px', color: '#6b7280' }}>Compliance</span>
                   <span style={{ fontSize: '12px', fontWeight: '600', color: '#ef4444' }}>Missing!</span>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </section>

      <section className="section-padding demo-section" id="demo">
        <div className="demo-header">
          <h2>Handcrafted goods.<br /><span>Market-ready data.</span></h2>
        </div>
        <div className="stats-grid">
          <div className="stat-card stat-card-hover">
            <h3>Millions</h3>
            <p>of hours wasted manually re-entering product data.</p>
          </div>
          <div className="stat-card stat-card-hover" style={{ borderTop: '4px solid var(--color-orange)' }}>
            <h3 style={{ color: 'var(--color-orange)' }}>1 product</h3>
            <p>becomes 10 different listings.</p>
          </div>
          <div className="stat-card stat-card-hover">
            <h3>0 guesswork</h3>
            <p>when knowing exactly what each market requires.</p>
          </div>
        </div>
        <p style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto', fontSize: '18px', opacity: 0.9 }}>
          PА turns artisan product information into market-ready listings while keeping the story, materials, and craftsmanship intact.
          It helps every basket, textile, and handmade item speak clearly across platforms.
        </p>
      </section>
    </>
  );
}
