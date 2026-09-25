import React, { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdaptiveMarketDemo() {
  const [activeMarket, setActiveMarket] = useState('amazon');

  const baseProduct = {
    name: 'Bamboo Storage Basket',
    material: '100% Natural Bamboo',
    dimensions: '600x400x300mm',
    weight: '1.2kg',
    color: 'Natural Wood',
    origin: 'Vietnam'
  };

  return (
    <section className="section-padding market-pack-section" id="adaptive">
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2>Bamboo Storage Basket.<br />Prepared for every market.</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '18px' }}>
          Pए keeps the artisan story intact while adapting the product details for each marketplace requirement.
        </p>
      </div>

      <div className="demo-container">
        {/* Source Data Card */}
        <div className="card">
          <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 'bold', marginBottom: '16px' }}>
            SOURCE: PRODUCT PASSPORT
          </div>
          <h3 style={{ fontSize: '24px', marginBottom: '24px' }}>{baseProduct.name}</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {Object.entries(baseProduct).map(([key, value]) => (
              <div key={key}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{key}</div>
                <div style={{ fontWeight: '500' }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Translation Arrow (desktop only) */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
           <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>Adapts to market requirements</p>
           <ArrowRight size={32} color="var(--color-orange)" />
        </div>

        {/* Target Market Card */}
        <div className="card" style={{ border: '2px solid var(--color-deep-green)' }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
            <button 
              className={`btn-primary ${activeMarket !== 'amazon' ? 'btn-secondary' : ''}`}
              style={activeMarket !== 'amazon' ? { border: '1px solid #e5e7eb' } : {}}
              onClick={() => setActiveMarket('amazon')}
            >
              Amazon
            </button>
            <button 
              className={`btn-primary ${activeMarket !== 'etsy' ? 'btn-secondary' : ''}`}
              style={activeMarket !== 'etsy' ? { border: '1px solid #e5e7eb' } : {}}
              onClick={() => setActiveMarket('etsy')}
            >
              Etsy
            </button>
            <button 
              className={`btn-primary ${activeMarket !== 'shopify' ? 'btn-secondary' : ''}`}
              style={activeMarket !== 'shopify' ? { border: '1px solid #e5e7eb' } : {}}
              onClick={() => setActiveMarket('shopify')}
            >
              Shopify
            </button>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb', minHeight: '260px' }}>
            <AnimatePresence mode="wait">
              {activeMarket === 'amazon' && (
                <motion.div
                  key="amazon"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#b91c1c' }}>COMPLIANCE REPORT: AMAZON</span>
                    <span style={{ fontSize: '12px', background: '#fef2f2', color: '#b91c1c', padding: '4px 10px', borderRadius: '12px', fontWeight: '500' }}>Missing ASIN</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px', fontWeight: '600' }}>A+ Content Bullet Points</div>
                  <ul style={{ margin: '0 0 16px', paddingLeft: '20px', fontSize: '14px', color: '#374151' }}>
                    <li><strong style={{color:'#111827'}}>MATERIAL:</strong> Made of {baseProduct.material}</li>
                    <li><strong style={{color:'#111827'}}>SIZE:</strong> Dimensions are {baseProduct.dimensions}</li>
                    <li><strong style={{color:'#111827'}}>HEFT:</strong> Weighs {baseProduct.weight}</li>
                  </ul>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px', fontWeight: '600' }}>Backend Search Terms (Max 250 bytes)</div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {['bamboo', 'storage', 'basket', 'natural', 'organizer', 'wood'].map(tag => (
                      <span key={tag} style={{ background: '#f3f4f6', color: '#4b5563', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', border: '1px solid #e5e7eb' }}>{tag}</span>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeMarket === 'etsy' && (
                <motion.div
                  key="etsy"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#047857' }}>COMPLIANCE REPORT: ETSY</span>
                    <span style={{ fontSize: '12px', background: '#ecfdf5', color: '#047857', padding: '4px 10px', borderRadius: '12px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Check size={14} /> Ready to Publish
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px', fontWeight: '600' }}>Artisan Story (Description)</div>
                  <p style={{ fontSize: '14px', margin: '0 0 16px', lineHeight: '1.6', color: '#374151' }}>
                    Handcrafted from <span style={{ background: '#fef3c7', padding: '0 4px' }}>{baseProduct.material}</span>, this beautiful <span style={{ background: '#fef3c7', padding: '0 4px' }}>{baseProduct.color}</span> basket brings a touch of nature into your home. Originating from artisans in <span style={{ background: '#fef3c7', padding: '0 4px' }}>{baseProduct.origin}</span>, it's perfect for organizing your space sustainably.
                  </p>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px', fontWeight: '600' }}>13 Allowed Tags</div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {['handmade basket', 'bamboo decor', 'sustainable'].map(tag => (
                      <span key={tag} style={{ background: '#f0fdf4', color: '#166534', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', border: '1px solid #bbf7d0' }}>{tag}</span>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeMarket === 'shopify' && (
                <motion.div
                  key="shopify"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#4f46e5' }}>COMPLIANCE REPORT: SHOPIFY (D2C)</span>
                    <span style={{ fontSize: '12px', background: '#e0e7ff', color: '#4338ca', padding: '4px 10px', borderRadius: '12px', fontWeight: '500' }}>Draft Mode</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px', fontWeight: '600' }}>SEO Meta Preview</div>
                  <div style={{ borderLeft: '3px solid #6366f1', paddingLeft: '12px', marginBottom: '16px' }}>
                    <div style={{ fontSize: '16px', color: '#4338ca', cursor: 'pointer', marginBottom: '4px' }}>Premium {baseProduct.name} - {baseProduct.color}</div>
                    <div style={{ fontSize: '13px', color: '#059669', marginBottom: '4px' }}>https://yourstore.com/products/bamboo-basket</div>
                    <div style={{ fontSize: '13px', color: '#4b5563', lineHeight: '1.4' }}>Organize with our {baseProduct.dimensions} basket. Made from {baseProduct.material}. Fast shipping available.</div>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px', fontWeight: '600' }}>Product Organization</div>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '13px' }}>
                    <div><strong style={{color:'#111827'}}>Vendor:</strong> Pए Local</div>
                    <div><strong style={{color:'#111827'}}>Type:</strong> Home & Storage</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
