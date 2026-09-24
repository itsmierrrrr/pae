import React, { useEffect, useRef, useState } from 'react';
import { Link, Navigate, NavLink, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Camera, CircleCheckBig, CircleDollarSign, Compass, Home, ImagePlus, Layers3, LayoutDashboard, Lightbulb, LogOut, Menu, MessageSquareText, Mic, Plus, ShieldCheck, Sparkles, Target, UploadCloud, UserRound, X } from 'lucide-react';
import api from './api.js';
import { XIcon, InstagramIcon, LinkedInIcon } from './components/SocialIcons.jsx';
import './App.css';

const STORAGE_KEY = 'pae_auth_token';

const initialForm = {
  title: '',
  category: 'Home & Lifestyle',
  subcategory: '',
  description: '',
  materials: '',
  price: '',
  quantity: '',
  imageUrl: '',
};

function App() {
  const storedToken = localStorage.getItem(STORAGE_KEY);
  const [token, setToken] = useState(storedToken === 'demo-token' ? '' : (storedToken || ''));

  useEffect(() => {
    if (token) {
      localStorage.setItem(STORAGE_KEY, token);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [token]);

  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<LandingPage token={token} />} />
        <Route path="/login" element={<LoginPage setToken={setToken} />} />
        <Route path="/register" element={<RegisterPage setToken={setToken} />} />
        <Route path="/dashboard" element={<ProtectedRoute token={token}><DashboardPage /></ProtectedRoute>} />
        <Route path="/products/new" element={<ProtectedRoute token={token}><AddProductPage /></ProtectedRoute>} />
        <Route path="/products/:id" element={<ProtectedRoute token={token}><ProductDetailPage /></ProtectedRoute>} />
        <Route path="/products/:id/interview" element={<ProtectedRoute token={token}><VoiceInterviewPage /></ProtectedRoute>} />
        <Route path="/products/:id/market-packs" element={<ProtectedRoute token={token}><MarketPacksPage /></ProtectedRoute>} />
        <Route path="/products/:id/opportunities" element={<ProtectedRoute token={token}><OpportunitiesPage /></ProtectedRoute>} />
        <Route path="/products/:id/validation" element={<ProtectedRoute token={token}><ValidationPage /></ProtectedRoute>} />
        <Route path="/products/:id/pricing" element={<ProtectedRoute token={token}><PricingPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute token={token}><ProfilePage /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}

function ProtectedRoute({ token, children }) {
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function LandingPage({ token }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="topbar landing-topbar">
        <div className="brand-wrap">
          <div className="brand-mark">PА</div>
          <div>
            <div className="brand-name">PА</div>
            <div className="brand-subtitle">From Craft to Market</div>
          </div>
        </div>
        <nav className={`nav ${menuOpen ? 'nav-open' : ''}`}>
          <NavLink to="/" end onClick={() => setMenuOpen(false)}><Home size={16} /> Home</NavLink>
          <NavLink to={token ? '/dashboard' : '/login'} onClick={() => setMenuOpen(false)}><LayoutDashboard size={16} /> Dashboard</NavLink>
          <NavLink to="/register" onClick={() => setMenuOpen(false)}>Get started</NavLink>
        </nav>
        <div className={`nav-actions ${menuOpen ? 'nav-actions-open' : ''}`}>
          {token ? (
            <Link to="/dashboard" className="button primary"><LayoutDashboard size={16} /> Open app</Link>
          ) : (
            <>
              <Link to="/login" className="button secondary">Login</Link>
              <Link to="/register" className="button primary">Register</Link>
            </>
          )}
        </div>
        <button className="nav-toggle" type="button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} onClick={() => setMenuOpen((current) => !current)}>
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </header>

      <main className="hero-shell">
        <section className="hero-card">
          <div className="hero-copy">
            <p className="eyebrow">AI productization for artisan makers</p>
            <h1>Turn handmade goods into a market-ready product passport.</h1>
            <p className="lead">
              Capture a product, extract its story, complete the missing details, verify it, and prepare it for the right market format.
            </p>
            <div className="cta-row">
              <Link to={token ? '/dashboard' : '/login'} className="button primary large">Open app</Link>
              <Link to="/register" className="button secondary large">Get started</Link>
            </div>
            <ul className="check-list">
              <li><CircleCheckBig size={18} /> Product photo + voice or text</li>
              <li><CircleCheckBig size={18} /> Passport + missing field interview</li>
              <li><CircleCheckBig size={18} /> Validation + market pack</li>
            </ul>
          </div>

          <div className="hero-panel">
            <div className="hero-visual">
              <img src="https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1200&q=85" alt="Artisan working with handmade materials at a craft table" />
              <div className="hero-visual-shade" />
              <div className="hero-visual-label"><span className="status-dot" /> Built around your craft</div>
              <div className="hero-float-card passport-card">
                <div className="passport-topline">
                  <span className="status-pill">Verified</span>
                  <span className="muted">Product passport</span>
                </div>
                <h3>Handwoven Bamboo Basket</h3>
                <div className="mini-grid">
                  <div><span>Material</span><strong>Bamboo</strong></div>
                  <div><span>Weight</span><strong>500 g</strong></div>
                  <div><span>Usage</span><strong>Storage</strong></div>
                  <div><span>Care</span><strong>Dry cloth</strong></div>
                </div>
                <div className="progress-row"><span className="active">Capture</span><span className="active">Complete</span><span className="active">Verify</span><span>Market</span></div>
              </div>
            </div>
          </div>
        </section>

        <section className="feature-grid">
          <FeatureCard icon={<Sparkles size={22} />} title="AI Productization" text="Turn a photo and description into a structured, evidence-based passport." />
          <FeatureCard icon={<Mic size={22} />} title="Voice Interview" text="Resolve only the missing details with a conversational flow." />
          <FeatureCard icon={<ShieldCheck size={22} />} title="Validation" text="Check required fields before the product is prepared for a market." />
          <FeatureCard icon={<CircleDollarSign size={22} />} title="Pricing Assistant" text="Estimate a transparent price range from your real material, labor, and other costs." />
          <FeatureCard icon={<Layers3 size={22} />} title="Adaptive Market Packs" text="Shape one verified Passport into clear formats for online, institutional, and social channels." />
          <FeatureCard icon={<Compass size={22} />} title="Opportunities" text="Explore curated prototype channels once your product is market ready." />
        </section>

        <section className="landing-proof" aria-label="Product workflow highlights">
          <div><strong>01</strong><span>Capture the real story</span></div>
          <div><strong>02</strong><span>Complete only what is missing</span></div>
          <div><strong>03</strong><span>Move from passport to market</span></div>
        </section>

        <section className="landing-gallery-section">
          <div className="gallery-heading">
            <div><p className="eyebrow">Made for the hands behind the work</p><h2>Every detail deserves a place.</h2></div>
            <p>Keep the material, method, and meaning close to the product. PА turns those details into a passport you can trust and a story customers can understand.</p>
          </div>
          <div className="landing-gallery">
            <article className="gallery-tile gallery-tile-wide"><img src="https://images.unsplash.com/photo-1523779917675-b6ed3a42a561?auto=format&fit=crop&w=1200&q=85" alt="Artisan hands shaping handmade work" /><div><span>Craft in context</span><strong>Show the making, not just the finished piece.</strong></div></article>
            <article className="gallery-tile"><img src="https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=900&q=85" alt="Handmade objects arranged in a warm studio" /><div><span>Product character</span><strong>Give every object its own point of view.</strong></div></article>
            <div className="gallery-note"><div className="gallery-note-mark"><Sparkles size={20} /></div><h3>Facts first. Better stories next.</h3><p>AI helps you find what to say without filling in what you do not know.</p><Link to={token ? '/dashboard' : '/register'} className="text-link">Build your passport <span>→</span></Link></div>
          </div>
        </section>

        <section className="landing-detail-band">
          <div className="detail-image-stack">
            <img className="detail-image-main" src="https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1000&q=85" alt="Handmade objects arranged in an artisan studio" />
            <img className="detail-image-small" src="https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=700&q=85" alt="Maker working carefully at a craft table" />
            <span className="detail-image-caption">Your process, made legible</span>
          </div>
          <div className="detail-band-copy">
            <p className="eyebrow">One calm workflow</p>
            <h2>Less admin. More attention on the thing you make.</h2>
            <p>Bring the product into focus with a guided path that respects what is known, asks for what is missing, and turns the finished passport into market-ready material.</p>
            <div className="detail-points">
              <div><span>01</span><div><strong>Keep facts grounded</strong><p>Your words stay separate from AI suggestions.</p></div></div>
              <div><span>02</span><div><strong>Ask only what matters</strong><p>The interview follows the details your passport still needs.</p></div></div>
              <div><span>03</span><div><strong>Finish with confidence</strong><p>Review, verify, and carry the same passport into every market pack.</p></div></div>
            </div>
            <Link to={token ? '/dashboard' : '/register'} className="button primary">Start your product story <span aria-hidden="true">→</span></Link>
          </div>
        </section>
      </main>

      <footer className="app-footer landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <strong style={{ fontSize: '20px', letterSpacing: '0.05em' }}>PA</strong>
            <span style={{ display: 'block', fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>From Craft to Market</span>
          </div>
          <nav style={{ display: 'flex', gap: '24px', fontSize: '14px' }}>
            <Link to="/">Home</Link>
            <Link to={token ? '/dashboard' : '/login'}>Dashboard</Link>
            <Link to="/register">Get started</Link>
          </nav>
          <div className="footer-links" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter"><XIcon /></a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><InstagramIcon /></a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn"><LinkedInIcon /></a>
          </div>
        </div>
        <div className="footer-bottom" style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(18,44,79,0.1)', fontSize: '12px', color: 'var(--muted)', textAlign: 'center' }}>
          &copy; {new Date().getFullYear()} PA. All rights reserved.
        </div>
      </footer>
    </>
  );
}


function FeatureCard({ icon, title, text }) {
  return (
    <div className="feature-card">
      <div className="icon-box">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function LoginPage({ setToken }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/auth/login', form);
      const nextToken = data?.data?.token || '';
      setToken(nextToken);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" caption="Sign in to continue crafting your product story.">
      <form className="form-card" onSubmit={handleSubmit}>
        <label>
          Email
          <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} type="email" placeholder="artisan@example.com" />
        </label>
        <label>
          Password
          <input value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} type="password" placeholder="••••••••" />
        </label>
        {error && <p className="error-text">{error}</p>}
        <button className="button primary wide" disabled={loading}>{loading ? 'Signing in...' : 'Login'}</button>
        <p className="switch-text">New here? <Link to="/register">Register</Link></p>
      </form>
    </AuthLayout>
  );
}

function RegisterPage({ setToken }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/auth/register', form);
      const nextToken = data?.data?.token || '';
      setToken(nextToken);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create your studio account" caption="Build your product passport and market-ready listings.">
      <form className="form-card" onSubmit={handleSubmit}>
        <label>
          Name
          <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} type="text" placeholder="Asha Maker" />
        </label>
        <label>
          Email
          <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} type="email" placeholder="artist@example.com" />
        </label>
        <label>
          Password
          <input value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} type="password" placeholder="••••••••" />
        </label>
        {error && <p className="error-text">{error}</p>}
        <button className="button primary wide" disabled={loading}>{loading ? 'Creating...' : 'Register'}</button>
        <p className="switch-text">Already have an account? <Link to="/login">Login</Link></p>
      </form>
    </AuthLayout>
  );
}

function AuthLayout({ title, caption, children }) {
  return (
    <div className="auth-page">
      <div className="auth-shell">
        <div className="auth-panel">
          <div className="brand-mark large">PА</div>
          <h2>{title}</h2>
          <p>{caption}</p>
          <div className="mini-progress">
            <span className="active">Capture</span>
            <span>Complete</span>
            <span>Verify</span>
          </div>
        </div>
        <div className="auth-form-area">{children}</div>
      </div>
    </div>
  );
}

function DashboardPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products')
      .then(({ data }) => setProducts(data?.data || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout title="Dashboard" description="Your products, passport flow, and next actions.">
      <div className="toolbar-row">
        <div className="pill-group">
          <span className="status-pill">Capture</span>
          <span className="status-pill neutral">Complete</span>
          <span className="status-pill neutral">Verify</span>
          <span className="status-pill neutral">Adapt</span>
        </div>
        <button className="button primary" onClick={() => navigate('/products/new')}>Add Product</button>
      </div>

      {loading ? (
        <div className="empty-card">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="empty-card">
          <h3>No products yet</h3>
          <p>Start with a product, upload a photo, and create your first product passport.</p>
          <button className="button primary" onClick={() => navigate('/products/new')}>Create product</button>
        </div>
      ) : (
        <div className="card-grid">
          {products.map((product) => (
            <div key={product.id} className="surface-card product-card" onClick={() => navigate(`/products/${product.id}`)}>
              <div className="product-thumb">
                {product.imageUrl ? <img src={`http://localhost:5000${product.imageUrl}`} alt={product.title} /> : <UploadCloud size={40} />}
              </div>
              <div className="product-card-body">
                <div className="meta-row">
                  <span className="status-pill small">{product.status || 'draft'}</span>
                </div>
                <h3>{product.title}</h3>
                <p>{product.description || 'No description yet.'}</p>
                <div className="kv-row"><span>Category</span><strong>{product.category || 'Unassigned'}</strong></div>
                <div className="kv-row"><span>Price</span><strong>₹{product.price || 0}</strong></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}

function AddProductPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      const { data } = await api.post('/uploads', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setImages([data.data.imageUrl]);
      handleChange('imageUrl', data.data.imageUrl);
    } catch (err) {
      setError(err.response?.data?.message || 'Image upload failed.');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...form,
        materials: form.materials.split(',').map((item) => item.trim()).filter(Boolean),
        price: Number(form.price || 0),
        quantity: Number(form.quantity || 0),
      };
      const { data } = await api.post('/products', payload);
      navigate(`/products/${data.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout title="Add Product" description="Create a new artisan product and start productization.">
      <form className="form-card wide-form" onSubmit={handleSubmit}>
        <div className="form-grid two-col">
          <label>
            Product name
            <input value={form.title} onChange={(event) => handleChange('title', event.target.value)} placeholder="Handwoven storage basket" />
          </label>
          <label>
            Category
            <input value={form.category} onChange={(event) => handleChange('category', event.target.value)} placeholder="Home & Lifestyle" />
          </label>
          <label>
            Subcategory
            <input value={form.subcategory} onChange={(event) => handleChange('subcategory', event.target.value)} placeholder="Storage" />
          </label>
          <label>
            Materials
            <input value={form.materials} onChange={(event) => handleChange('materials', event.target.value)} placeholder="Bamboo, natural fiber" />
          </label>
          <label>
            Price (₹)
            <input value={form.price} onChange={(event) => handleChange('price', event.target.value)} placeholder="1200" />
          </label>
          <label>
            Quantity
            <input value={form.quantity} onChange={(event) => handleChange('quantity', event.target.value)} placeholder="10" />
          </label>
        </div>

        <label>
          Product description
          <textarea value={form.description} onChange={(event) => handleChange('description', event.target.value)} rows="4" placeholder="Describe the product, materials, craft, and how it is used." />
        </label>

        <div className="upload-box">
          <input type="file" accept="image/*" id="product-image" onChange={handleImageUpload} />
          <label htmlFor="product-image" className="upload-label">
            <ImagePlus size={18} />
            {images.length ? 'Image attached' : 'Upload Photo'}
          </label>
        </div>

        {error && <p className="error-text">{error}</p>}
        <button className="button primary" disabled={loading}>{loading ? 'Saving...' : 'Create Product'}</button>
      </form>
    </AppLayout>
  );
}

const formatPassportValue = (value) => {
  if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) return '';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') {
    if (value.value) return value.value;
    return Object.entries(value).map(([key, item]) => `${key}: ${item}`).join(', ');
  }
  return String(value);
};

const parsePassportValue = (value) => {
  const text = String(value || '').trim();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { value: text };
  }
};

const toPassportDraft = (passport = {}) => ({
  productName: passport.identity?.productName || '',
  category: passport.identity?.category || '',
  material: formatPassportValue(passport.materials),
  dimensions: formatPassportValue(passport.dimensions),
  weight: formatPassportValue(passport.weight),
  craftingTime: formatPassportValue(passport.craft?.craftingTime),
  usage: formatPassportValue(passport.usage),
  careInstructions: passport.careInstructions || '',
});

function PassportField({ label, value }) {
  const displayValue = formatPassportValue(value);
  return (
    <div className="passport-field">
      <div><span>{label}</span><strong>{displayValue || 'Unknown'}</strong></div>
      <span className={`field-status ${displayValue ? 'confirmed' : 'missing'}`}>{displayValue ? '✓ Confirmed' : '○ Missing'}</span>
    </div>
  );
}

function RecommendationBlock({ icon, title, text }) {
  return <div className="recommendation-block"><div className="recommendation-block-title"><span className="recommendation-icon">{icon}</span><h4>{title}</h4></div><p>{text}</p></div>;
}

function RecommendationList({ icon, title, items = [] }) {
  return <div className="recommendation-block"><div className="recommendation-block-title"><span className="recommendation-icon">{icon}</span><h4>{title}</h4></div>{items.length ? <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul> : <p>Not available yet</p>}</div>;
}

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [passport, setPassport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState({});

  useEffect(() => {
    let active = true;
    // oxlint-disable-next-line react/set-state-in-effect
    setLoading(true);
    
    const fetchLoad = async () => {
      try {
        const [productResult, passportResult] = await Promise.all([
          api.get(`/products/${id}`),
          api.get(`/products/${id}/passport`),
        ]);
        if (active) {
          setProduct(productResult.data.data);
          setPassport(passportResult.data.data || {});
          setDraft(toPassportDraft(passportResult.data.data || {}));
        }
      } catch (err) {
        if (active) console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchLoad();

    return () => {
      active = false;
    };
  }, [id]);

  const productize = async () => {
    setActionLoading(true);
    setError('');
    try {
      const { data } = await api.post(`/products/${id}/productize`);
      setPassport(data.data.passport);
      setProduct(data.data.product);
      setDraft(toPassportDraft(data.data.passport));
    } catch (err) {
      setError(err.response?.data?.message || 'Productization failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const savePassport = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const { data } = await api.put(`/products/${id}/passport`, {
        identity: {
          ...(passport?.identity || {}),
          productName: draft.productName || null,
          category: draft.category || null,
        },
        materials: draft.material ? draft.material.split(',').map((item) => item.trim()).filter(Boolean) : [],
        dimensions: parsePassportValue(draft.dimensions),
        weight: parsePassportValue(draft.weight),
        craft: { ...(passport?.craft || {}), craftingTime: draft.craftingTime || null },
        usage: draft.usage ? draft.usage.split(',').map((item) => item.trim()).filter(Boolean) : [],
        careInstructions: draft.careInstructions || null,
      });
      setPassport(data.data);
      setProduct((current) => ({ ...current, missingFields: data.data.missingFields, status: data.data.missingFields.length ? 'needs_information' : 'complete' }));
      setDraft(toPassportDraft(data.data));
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save passport.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AppLayout title="Loading product" description="Preparing your product passport." />;
  if (!product) return <AppLayout title="Product not found" description="" />;

  const missingFields = passport?.missingFields || product.missingFields || [];
  const primaryAction = missingFields.length
    ? { label: 'Complete Product', onClick: () => navigate(`/products/${id}/interview`) }
    : passport?.verified
      ? { label: 'Create Market Pack', onClick: () => navigate(`/products/${id}/market-packs`) }
      : { label: 'Review Product', onClick: () => navigate(`/products/${id}/validation`) };
  const detailJourneyStep = missingFields.length
    ? 'complete'
    : product.status === 'market_ready'
      ? 'market-ready'
      : passport?.verified
        ? 'price'
        : 'review';

  return (
    <AppLayout title={product.title} description="Product passport and next actions." journeyOverride={detailJourneyStep}>
      <div className="detail-actions">
        <button className="button primary" onClick={missingFields.length ? primaryAction.onClick : productize} disabled={actionLoading}>
          {actionLoading ? 'Preparing...' : missingFields.length ? `${primaryAction.label} 🎙` : primaryAction.label}
        </button>
        {missingFields.length === 0 && !passport?.verified && <button className="button secondary" onClick={primaryAction.onClick}>Review Product</button>}
        <button className="button secondary" onClick={() => setEditing((current) => !current)}>{editing ? 'Cancel edit' : 'Edit passport'}</button>
        {passport?.verified && <button className="button secondary" onClick={() => navigate(`/products/${id}/market-packs`)}>Market pack</button>}
        {missingFields.length === 0 && <button className="button secondary" onClick={() => navigate(`/products/${id}/pricing`)}>Pricing</button>}
        {product.status === 'market_ready' && <button className="button primary" onClick={() => navigate(`/products/${id}/opportunities`)}>Explore opportunities</button>}
      </div>
      {missingFields.length === 0 && !passport?.verified && <div className="next-step-card"><div><p className="eyebrow">Next step</p><strong>Review the completed Passport and verify it before pricing or adapting it.</strong></div><Link className="button primary" to={`/products/${id}/validation`}>Review &amp; Verify</Link></div>}
      {passport?.verified && product.status !== 'market_ready' && <div className="next-step-card"><div><p className="eyebrow">Verified Passport</p><strong>Continue with pricing, then adapt this product for a market format.</strong></div><div className="detail-actions"><Link className="button primary" to={`/products/${id}/pricing`}>Price product</Link><Link className="button secondary" to={`/products/${id}/market-packs`}>Adapt to market</Link></div></div>}
      {product.status === 'market_ready' && <div className="next-step-card"><div><p className="eyebrow">Market ready</p><strong>Your validated pack is ready to take into a real submission workflow.</strong></div><Link className="button primary" to={`/products/${id}/opportunities`}>Explore opportunities</Link></div>}
      {error && <p className="error-text page-error">{error}</p>}

      {editing ? (
        <form className="surface-card passport-edit-form" onSubmit={savePassport}>
          <div className="section-heading"><div><p className="eyebrow">Product information</p><h3>Edit product passport</h3></div><span className="small-copy">Facts only</span></div>
          <div className="form-grid two-col">
            <label>Product name<input value={draft.productName || ''} onChange={(event) => setDraft({ ...draft, productName: event.target.value })} /></label>
            <label>Category<input value={draft.category || ''} onChange={(event) => setDraft({ ...draft, category: event.target.value })} /></label>
            <label>Material<input value={draft.material || ''} onChange={(event) => setDraft({ ...draft, material: event.target.value })} /></label>
            <label>Dimensions<input value={draft.dimensions || ''} onChange={(event) => setDraft({ ...draft, dimensions: event.target.value })} placeholder="6 cm long, 4 cm wide" /></label>
            <label>Weight<input value={draft.weight || ''} onChange={(event) => setDraft({ ...draft, weight: event.target.value })} placeholder="20 g" /></label>
            <label>Crafting time<input value={draft.craftingTime || ''} onChange={(event) => setDraft({ ...draft, craftingTime: event.target.value })} placeholder="2 hours" /></label>
            <label>Usage<input value={draft.usage || ''} onChange={(event) => setDraft({ ...draft, usage: event.target.value })} placeholder="Keychain, gifting" /></label>
            <label>Care<input value={draft.careInstructions || ''} onChange={(event) => setDraft({ ...draft, careInstructions: event.target.value })} /></label>
          </div>
          <button className="button primary" disabled={saving}>{saving ? 'Saving...' : 'Save passport'}</button>
        </form>
      ) : (
        <div className="two-col-layout">
          <section className="surface-card">
            <div className="section-heading"><div><p className="eyebrow">Product passport</p><h3>Product information</h3></div><span className="fact-badge">Verified facts</span></div>
            <PassportField label="Product name" value={passport?.identity?.productName} />
            <PassportField label="Category" value={passport?.identity?.category} />
            <PassportField label="Material" value={passport?.materials} />
            <PassportField label="Dimensions" value={passport?.dimensions} />
            <PassportField label="Weight" value={passport?.weight} />
            <PassportField label="Crafting time" value={passport?.craft?.craftingTime} />
            <PassportField label="Usage" value={passport?.usage} />
            <PassportField label="Care" value={passport?.careInstructions} />
          </section>

          <section className="surface-card passport-status-card">
            <div className="status-card-heading"><div className="status-icon"><ShieldCheck size={21} /></div><div><p className="eyebrow">Passport status</p><h3>{missingFields.length ? 'Complete your product' : 'Ready for review'}</h3></div></div>
            <div className="completion-meter"><div className="completion-meter-top"><strong>{missingFields.length ? `${missingFields.length} details needed` : '✓ Product information complete'}</strong><span>{Math.round(((8 - missingFields.length) / 8) * 100)}%</span></div><div className="completion-track"><span style={{ width: `${Math.max(0, Math.min(100, ((8 - missingFields.length) / 8) * 100))}%` }} /></div></div>
            <div className="status-list"><span className="status-pill confirmed-pill">✓ Confirmed</span><span className="status-pill neutral">? Needs confirmation</span><span className="status-pill neutral">○ Missing</span></div>
            <div className="kv-row"><span>Verification</span><strong>{passport?.verified ? 'Verified' : 'Not verified'}</strong></div>
            {missingFields.length > 0 && <button className="button primary wide" onClick={() => navigate(`/products/${id}/interview`)}>Complete Product 🎙</button>}
            <p className="small-copy">Unknown information remains empty until the artisan confirms it.</p>
          </section>
        </div>
      )}

      <section className="surface-card recommendations-card">
        <div className="section-heading"><div><p className="eyebrow">Suggestions only</p><h3>AI Recommendations</h3></div><span className="status-pill recommendation-badge"><Sparkles size={13} /> Not verified facts</span></div>
        <div className="recommendation-grid">
          <RecommendationBlock icon={<Lightbulb size={18} />} title="Positioning" text={passport?.recommendations?.positioning || 'Generate recommendations by productizing this item.'} />
          <RecommendationBlock icon={<Target size={18} />} title="Ideal customer" text={passport?.recommendations?.idealCustomer || 'Not available yet'} />
          <RecommendationBlock icon={<MessageSquareText size={18} />} title="Story angle" text={passport?.recommendations?.storyAngle || 'Not available yet'} />
          <RecommendationBlock icon={<Target size={18} />} title="Market fit" text={passport?.recommendations?.marketFit || 'Not available yet'} />
          <div className="recommendation-block"><div className="recommendation-block-title"><span className="recommendation-icon"><Sparkles size={18} /></span><h4>Suggested price</h4></div><strong className="price-callout">{passport?.recommendations?.suggestedPrice?.min !== null && passport?.recommendations?.suggestedPrice?.max !== null && passport?.recommendations?.suggestedPrice ? `${passport.recommendations.suggestedPrice.currency || 'INR'} ${passport.recommendations.suggestedPrice.min} - ${passport.recommendations.suggestedPrice.max}` : 'Not available yet'}</strong></div>
          <RecommendationList icon={<CircleCheckBig size={18} />} title="Selling points" items={passport?.recommendations?.sellingPoints} />
          <RecommendationList icon={<Sparkles size={18} />} title="Improve next" items={passport?.recommendations?.improvements} />
          <RecommendationList icon={<Camera size={18} />} title="Photo guidance" items={passport?.recommendations?.photoGuidance} />
          <RecommendationList icon={<MessageSquareText size={18} />} title="Content ideas" items={passport?.recommendations?.contentIdeas} />
          <RecommendationList icon={<CircleCheckBig size={18} />} title="Next actions" items={passport?.recommendations?.nextActions} />
        </div>
      </section>
    </AppLayout>
  );
}

function VoiceInterviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState('Preparing the next question...');
  const [answer, setAnswer] = useState('');
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [recording, setRecording] = useState(false);
  const recorderRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    api.post(`/products/${id}/interview/start`).then(({ data }) => {
      setSession(data.data.session);
      setQuestion(data.data.question.question);
    }).catch((err) => setError(err.response?.data?.message || 'Unable to start interview.')).finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async () => {
    if (!answer.trim() || submitting || session?.status === 'completed') return;
    setSubmitting(true);
    setError('');
    try {
      const { data } = await api.post(`/products/${id}/interview/answer`, { field: session.currentField, answer });
      const nextSession = data.data.interview || data.data.session;
      setSession(nextSession);
      setQuestion(nextSession.currentQuestion);
      setAnswer('');
      if (nextSession.status === 'completed') {
        navigate(`/products/${id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save this answer.');
    } finally {
      setSubmitting(false);
    }
  };

  const startVoiceCapture = async () => {
    setError('');
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setError('Voice capture is unavailable in this browser. Use the text answer below.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-IN';
        recognition.interimResults = false;
        recognition.onresult = (event) => setAnswer(event.results[0][0].transcript);
        recognition.onerror = () => setError('Voice transcription failed. Use the text answer below.');
        recognitionRef.current = recognition;
        recognition.start();
      }
      recorder.onstop = () => stream.getTracks().forEach((track) => track.stop());
      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
    } catch {
      setError('Microphone access was unavailable. Use the text answer below.');
    }
  };

  const stopVoiceCapture = () => {
    recorderRef.current?.stop();
    recognitionRef.current?.stop();
    recorderRef.current = null;
    recognitionRef.current = null;
    setRecording(false);
  };

  return (
    <AppLayout title="Voice Interview" description="Ask the next useful question for the product passport.">
      <div className="surface-card interview-card">
        {loading ? <p className="small-copy">Preparing your missing details...</p> : (
          <>
            <div className="interview-progress"><strong>{session?.missingFields?.length || 0} details needed</strong><span>{session?.currentField || 'Complete'}</span></div>
        <div className="chat-bubble">
          <h3>Product Assistant</h3>
          <p>{question}</p>
        </div>
        <div className="voice-row">
          <button type="button" className={`button voice-button ${recording ? 'recording' : ''}`} aria-pressed={recording} onClick={recording ? stopVoiceCapture : startVoiceCapture}><Mic size={17} /> {recording ? 'Stop recording' : 'Use voice'}</button>
          <span className="small-copy">{recording ? 'Listening... speak your answer' : 'Or type your answer below'}</span>
        </div>
        <textarea value={answer} onChange={(event) => setAnswer(event.target.value)} rows="4" placeholder="Type your answer..." />
        {error && <p className="error-text">{error}</p>}
        {session?.status === 'completed' ? (
          <>
            <p className="complete-message">✓ Product information complete</p>
            <button className="button primary" onClick={() => navigate(`/products/${id}`)}>Return to passport</button>
          </>
        ) : <button className="button primary" onClick={handleSubmit} disabled={submitting || !answer.trim()}>{submitting ? 'Saving...' : 'Save and continue'}</button>}
        {session && <p className="small-copy">Status: {session.status}</p>}
          </>
        )}
      </div>
    </AppLayout>
  );
}

function MarketPacksPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [packs, setPacks] = useState([]);
  const [activePackId, setActivePackId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const exportPack = (pack) => {
    const text = `Market Format: ${pack.marketName}

Title:
${pack.content?.title || 'N/A'}

Short Description:
${pack.content?.shortDescription || 'N/A'}

Detailed Description:
${pack.content?.detailedDescription || 'N/A'}

Attributes:
${Object.entries(pack.content?.attributes || {}).map(([k, v]) => `${k.replace(/([A-Z])/g, ' $1')}: ${typeof v === 'object' ? JSON.stringify(v) : v}`).join('\n')}

Tags:
${pack.content?.tags?.join(', ') || 'None'}

Presentation Notes:
${pack.content?.presentationNotes || 'N/A'}
`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pack.marketKey}_content_export.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const normalizePack = (pack) => ({
    ...pack,
    id: pack.id || pack._id,
    marketKey: pack.marketKey || (pack.marketName?.includes('Institutional') ? 'marketB' : pack.marketName?.includes('Social') ? 'marketC' : 'marketA'),
    content: pack.content || {},
  });

  useEffect(() => {
    api.get(`/products/${id}/market-packs`).then(({ data }) => {
      const normalized = (data.data || []).map(normalizePack);
      setPacks(normalized);
      if (normalized[0]) setActivePackId(normalized[0].id);
    }).catch((err) => setError(err.response?.data?.message || 'Unable to load market packs.'));
  }, [id]);

  const createPack = async (marketKey = 'marketA') => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post(`/products/${id}/market-packs`, { marketKey });
      const generated = normalizePack(data.data);
      setPacks((current) => [generated, ...current.filter((pack) => pack.marketKey !== marketKey)]);
      setActivePackId(generated.id);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to generate this market pack.');
    } finally {
      setLoading(false);
    }
  };

  const validatePack = async (packId) => {
    try {
      const { data } = await api.post(`/market-packs/${packId}/validate`);
      setPacks((current) => current.map((pack) => pack.id === packId ? data.data : pack));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to run the prototype check.');
    }
  };

  const copyPack = async (pack) => {
    await navigator.clipboard?.writeText(JSON.stringify(pack.content, null, 2));
  };

  const activePack = packs.find((pack) => pack.id === activePackId) || packs[0];

  return (
    <AppLayout title="Adaptive Market Pack" description="Turn one verified Passport into three clear channel-specific presentations.">
      <div className="market-intro"><div className="market-intro-icon"><Layers3 size={22} /></div><div><p className="eyebrow">Adapt the same product</p><h3>Choose how you want to present it</h3><p>Each option rewrites the presentation for a different audience. Confirmed material, dimensions, usage, care, and price remain unchanged.</p></div></div>
      <div className="detail-actions">
        <button className="button primary" disabled={loading} onClick={() => createPack('marketA')}>Generate Online Listing</button>
        <button className="button secondary" disabled={loading} onClick={() => createPack('marketB')}>Generate Institutional Pack</button>
        <button className="button secondary" disabled={loading} onClick={() => createPack('marketC')}>Generate Social Catalog</button>
      </div>
      {error && <p className="error-text page-error">{error}</p>}

      <div className="market-tabs">
        {packs.map((pack) => <button key={pack.id} className={`market-tab ${pack.id === activePack?.id ? 'active' : ''}`} onClick={() => setActivePackId(pack.id)}>{pack.marketKey === 'marketA' ? 'Online' : pack.marketKey === 'marketB' ? 'Institutional' : 'Social Catalog'}</button>)}
      </div>

      <div className="card-grid">
        {packs.length === 0 ? (
          <div className="empty-card"><h3>Create a market-ready representation</h3><p>Choose a format above to adapt the verified Passport for a specific channel.</p></div>
        ) : (
          activePack && <div className="surface-card market-preview-card">
            <div className="section-heading"><div><p className="eyebrow">Prototype market pack</p><h3>{activePack.marketName}</h3></div><span className={`status-pill ${activePack.ready ? 'confirmed-pill' : 'neutral'}`}>{activePack.ready ? 'Ready for submission' : 'Needs attention'}</span></div>
            <div className="market-preview-grid">
              <div className="recommendation-block"><h4>Title</h4><p>{typeof activePack.content?.title === 'object' ? JSON.stringify(activePack.content.title) : (activePack.content?.title || 'Not available')}</p></div>
              <div className="recommendation-block"><h4>Short description</h4><p>{typeof activePack.content?.shortDescription === 'object' ? JSON.stringify(activePack.content.shortDescription) : (activePack.content?.shortDescription || 'Not available')}</p></div>
              <div className="recommendation-block"><h4>Detailed description</h4><p>{typeof activePack.content?.detailedDescription === 'object' ? JSON.stringify(activePack.content.detailedDescription) : (activePack.content?.detailedDescription || 'Not available')}</p></div>
              <div className="recommendation-block">
                <h4>Attributes</h4>
                {activePack.content?.attributes ? (
                  <ul style={{ listStyleType: 'none', padding: 0, margin: 0, fontSize: '14px', lineHeight: '1.6' }}>
                    {Object.entries(activePack.content.attributes).map(([key, value]) => (
                      <li key={key}>
                        <strong style={{ textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1')}:</strong>{' '}
                        {typeof value === 'object' ? JSON.stringify(value) : (value || 'N/A')}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Not available</p>
                )}
              </div>
              <div className="recommendation-block"><h4>Tags</h4><p>{Array.isArray(activePack.content?.tags) ? activePack.content.tags.join(', ') : 'None'}</p></div>
              <div className="recommendation-block"><h4>Presentation notes</h4><p>{typeof activePack.content?.presentationNotes === 'object' ? JSON.stringify(activePack.content.presentationNotes) : (activePack.content?.presentationNotes || 'Not available')}</p></div>
            </div>
            <p className="small-copy">Prototype market pack generated from the verified Product Passport. No live marketplace publishing is performed.</p>
            <div className="detail-actions">
              {!activePack.ready ? (
                <button className="button primary" onClick={() => validatePack(activePack.id)}>Next: Run Pre-Rejection Check</button>
              ) : (
                <button className="button primary" onClick={() => navigate(`/products/${id}/opportunities`)}>Next: Market ready - Discover platforms & schemes</button>
              )}
              <button className="button secondary" onClick={() => copyPack(activePack)}>Copy content</button>
              <button className="button secondary" onClick={() => exportPack(activePack)}>Export content</button>
            </div>
            {activePack.validation && <div className="validation-summary"><strong>{activePack.validation.passed ? '✓ No prototype validation issues found' : `⚠ ${activePack.validation.issues?.length || 0} issues found`}</strong><span>{activePack.validation.prototypeNote}</span>{activePack.validation.issues?.map((issue) => <p key={issue.field}>⚠ {issue.message}</p>)}</div>}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function ValidationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [validation, setValidation] = useState({ issues: [], passed: false });
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/products/${id}/passport`).then(({ data }) => {
      const passport = data.data || {};
      const check = {
        passed: !(passport.missingFields || []).length,
        issues: (passport.missingFields || []).map((field) => ({ field, message: `${field} is missing.` })),
      };
      setValidation(check);
    });
  }, [id]);

  const verifyProduct = async () => {
    setVerifying(true);
    setError('');
    try {
      await api.post(`/products/${id}/passport/verify`);
      navigate(`/products/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to verify product.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <AppLayout title="Pre-submission validation" description="Use deterministic checks before submitting to a market.">
      <div className="surface-card">
        <h3>{validation.passed ? 'Ready for submission' : 'Missing required information'}</h3>
        {validation.issues.length === 0 ? (
          <p>All required checks appear in good order.</p>
        ) : (
          <ul className="issue-list">
            {validation.issues.map((issue) => (
              <li key={issue.field}>{issue.message}</li>
            ))}
          </ul>
        )}
        {error && <p className="error-text">{error}</p>}
        {validation.passed && <button className="button primary" onClick={verifyProduct} disabled={verifying}>{verifying ? 'Verifying...' : 'Verify Product'}</button>}
      </div>
    </AppLayout>
  );
}

function OpportunitiesPage() {
  const opportunities = [
    { title: 'Institutional Channel', type: 'Channel', description: 'A structured route for presenting verified product information to institutional audiences.', why: 'Your product has a completed Passport and market-ready specification.' },
    { title: 'Social Commerce Catalog', type: 'Channel', description: 'A visual, story-led format for sharing a product with customers through catalog content.', why: 'Your product has a clear story, material, and use case to present.' },
    { title: 'General Online Listing', type: 'Channel', description: 'A flexible product listing format for online discovery and direct customer interest.', why: 'Your verified Passport can provide consistent listing details across channels.' },
  ];

  return (
    <AppLayout title="Explore Opportunities" description="Prototype channels selected from your market-ready product information.">
      <div className="opportunity-notice"><Sparkles size={18} /><span>Prototype opportunities only. No live marketplace connection or eligibility claim is being made.</span></div>
      <div className="card-grid opportunities-grid">
        {opportunities.map((opportunity) => (
          <article className="surface-card opportunity-card" key={opportunity.title}>
            <span className="status-pill small">{opportunity.type}</span>
            <h3>{opportunity.title}</h3>
            <p>{opportunity.description}</p>
            <div className="kv-row"><span>Relevant because</span><strong>{opportunity.why}</strong></div>
            <span className="prototype-label">Prototype opportunity</span>
          </article>
        ))}
      </div>
    </AppLayout>
  );
}

function PricingPage() {
  const { id } = useParams();
  const [form, setForm] = useState({ materialCost: '', laborCost: '', additionalCosts: '', quantity: '', craftingTime: '' });
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get(`/products/${id}/pricing`).catch(() => null),
      api.get(`/products/${id}/passport`).catch(() => null),
    ]).then(([pricingResult, passportResult]) => {
      if (pricingResult?.data?.data) setPricing(pricingResult.data.data);
      const passport = passportResult?.data?.data;
      if (passport) setForm((current) => ({
        ...current,
        quantity: passport.commercial?.quantity || '',
        craftingTime: passport.craft?.craftingTime || '',
      }));
    });
  }, [id]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post(`/products/${id}/pricing`, form);
      setPricing(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to calculate pricing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout title="Pricing" description="A transparent estimate based on material, labor, and added costs.">
      <div className="two-col-layout">
        <form className="form-card" onSubmit={handleSubmit}>
          <div><p className="eyebrow">Pricing Assistant</p><h3>Estimate a fair price</h3><p className="small-copy">Edit these inputs without changing the Product Passport.</p></div>
          <label>
            Material cost
            <input value={form.materialCost} onChange={(event) => setForm({ ...form, materialCost: event.target.value })} placeholder="500" />
          </label>
          <label>
            Labor cost
            <input value={form.laborCost} onChange={(event) => setForm({ ...form, laborCost: event.target.value })} placeholder="700" />
          </label>
          <label>
            Additional costs
            <input value={form.additionalCosts} onChange={(event) => setForm({ ...form, additionalCosts: event.target.value })} placeholder="200" />
          </label>
          <label>
            Quantity produced
            <input value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} placeholder="10" />
          </label>
          <label>
            Crafting time
            <input value={form.craftingTime} onChange={(event) => setForm({ ...form, craftingTime: event.target.value })} placeholder="2 hours" />
          </label>
          {error && <p className="error-text">{error}</p>}
          <button className="button primary" disabled={loading}>{loading ? 'Calculating...' : 'Calculate price'}</button>
        </form>

        <div className="surface-card">
          {pricing ? (
            <>
              <h3>Suggested range</h3>
              <p className="price-callout">₹{pricing.suggestedRange?.minimum} – ₹{pricing.suggestedRange?.maximum}</p>
              <h4>Why?</h4>
              <ul className="issue-list">
                <li>Material cost: ₹{pricing.materialCost}</li>
                <li>Labor cost: ₹{pricing.laborCost}</li>
                <li>Other costs: ₹{pricing.additionalCosts}</li>
                <li>Estimated total cost: ₹{pricing.totalCost}</li>
                <li>Prototype pricing margin/range applied</li>
              </ul>
              <div className="kv-row"><span>Minimum</span><strong>₹{pricing.suggestedRange?.minimum}</strong></div>
              <div className="kv-row"><span>Recommended</span><strong>₹{pricing.suggestedRange?.recommended}</strong></div>
              <div className="kv-row"><span>Maximum</span><strong>₹{pricing.suggestedRange?.maximum}</strong></div>
              <p className="small-copy">{pricing.rationale}</p>
              <p className="small-copy"><strong>Confidence / limitation:</strong> {pricing.limitation}</p>
            </>
          ) : (
            <p className="small-copy">Enter the cost inputs to generate a transparent pricing range.</p>
          )}
        </div>
      </div>
      <div className="next-step-card pricing-next-step"><div><p className="eyebrow">Next step</p><strong>Price set? Adapt the verified Passport for the channel you want to reach.</strong></div><Link className="button primary" to={`/products/${id}/market-packs`}>Adapt product →</Link></div>
    </AppLayout>
  );
}

function ProfilePage() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    api.get('/auth/me').then(({ data }) => setProfile(data.data)).catch(() => setProfile(null));
  }, []);

  return (
    <AppLayout title="Profile" description="Studio profile and account details.">
      <div className="surface-card profile-card">
        <div className="profile-avatar"><UserRound size={28} /></div>
        <h3>{profile?.name || 'Artisan'}</h3>
        <p>{profile?.email || 'No email available.'}</p>
      </div>
    </AppLayout>
  );
}

function AppLayout({ title, description, children, journeyOverride }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const journeyStep = journeyOverride || getJourneyStep(location.pathname);

  return (
    <div className="page-shell">
      <header className="topbar page-header workspace-topbar">
        <div className="brand-wrap">
          <div className="brand-mark">PА</div>
          <div>
            <div className="brand-name">PА</div>
            <div className="brand-subtitle">From Craft to Market</div>
          </div>
        </div>
        <nav className={`nav inner-nav ${menuOpen ? 'nav-open' : ''}`}>
          <NavLink to="/dashboard" onClick={() => setMenuOpen(false)}><LayoutDashboard size={16} /> Dashboard</NavLink>
          <NavLink to="/profile" onClick={() => setMenuOpen(false)}><UserRound size={16} /> Profile</NavLink>
          <NavLink to="/" end onClick={() => setMenuOpen(false)}><Home size={16} /> Home</NavLink>
        </nav>
        <div className={`nav-actions ${menuOpen ? 'nav-actions-open' : ''}`}>
          <button className="button secondary" onClick={() => {
            localStorage.removeItem(STORAGE_KEY);
            window.location.assign('/login');
          }}><LogOut size={16} /> Logout</button>
          <Link to="/products/new" className="button primary"><Plus size={16} /> New product</Link>
        </div>
        <button className="nav-toggle" type="button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} onClick={() => setMenuOpen((current) => !current)}>
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </header>

      <main className="content-shell">
        <div className="page-toolbar">
          <button type="button" className="back-button" onClick={() => navigate(-1)}><ArrowLeft size={16} /> Back</button>
        </div>
        {id && <ProductJourney productId={id} currentStep={journeyStep} />}
        <div className="page-head">
          <div>
            <p className="eyebrow">Studio workspace</p>
            <h1>{title}</h1>
          </div>
          {description && <p className="page-copy">{description}</p>}
        </div>
        {children}
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <strong style={{ fontSize: '18px' }}>PA</strong>
            <span style={{ display: 'block', fontSize: '12px', color: 'var(--navy-soft)' }}>From Craft to Market</span>
          </div>
          <div className="footer-links" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter"><XIcon /></a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><InstagramIcon /></a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn"><LinkedInIcon /></a>
          </div>
        </div>
        <div className="footer-bottom" style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(18, 44, 79, 0.1)', fontSize: '12px', color: 'var(--navy-soft)' }}>
          &copy; {new Date().getFullYear()} PA. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

const getJourneyStep = (pathname) => {
  if (pathname.includes('/interview')) return 'complete';
  if (pathname.includes('/validation')) return 'verify';
  if (pathname.includes('/pricing')) return 'price';
  if (pathname.includes('/market-packs')) return 'adapt';
  if (pathname.includes('/opportunities')) return 'market-ready';
  return 'review';
};

function ProductJourney({ productId, currentStep }) {
  const steps = [
    { key: 'product', label: 'Product', path: `/products/${productId}` },
    { key: 'complete', label: 'Complete', path: `/products/${productId}/interview` },
    { key: 'review', label: 'Review', path: `/products/${productId}/validation` },
    { key: 'verify', label: 'Verify', path: `/products/${productId}/validation` },
    { key: 'price', label: 'Price', path: `/products/${productId}/pricing` },
    { key: 'adapt', label: 'Adapt', path: `/products/${productId}/market-packs` },
    { key: 'validate', label: 'Validate', path: `/products/${productId}/market-packs` },
    { key: 'market-ready', label: 'Market Ready', path: `/products/${productId}/opportunities` },
  ];
  const activeIndex = Math.max(0, steps.findIndex((step) => step.key === currentStep));

  return (
    <nav className="product-journey" aria-label="Product journey">
      {steps.map((step, index) => {
        const reached = index <= activeIndex;
        return (
          <Link key={step.key} className={`journey-link ${step.key === currentStep ? 'active' : ''} ${reached ? 'reached' : ''}`} to={step.path}>
            <span>{reached ? '✓' : '○'}</span>{step.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default App;
