import React, { useEffect, useState } from 'react';
import { Mic, Send, CheckCircle2 } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

const normalizePassport = (passport = {}) => ({
  title: passport.title || 'Ceramic Mug',
  price: passport.price ? `$${passport.price}` : null,
  material: passport.materials?.[0] || null,
  weight: passport.weight
    ? `${passport.weight.value ?? ''} ${passport.weight.unit ?? ''}`.trim()
    : null,
  category: passport.category || null,
  completeness: passport.completeness_score ?? 0,
});

export default function VoiceInterviewDemo() {
  const [step, setStep] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [session, setSession] = useState(null);
  const [passport, setPassport] = useState({
    title: 'Ceramic Mug',
    price: null,
    material: null,
    weight: null,
    category: null,
    completeness: 0,
  });

  const currentQuestion = session?.current_question;
  const latestHistory = session?.history?.[session.history.length - 1];
  const currentTarget = currentQuestion
    ? { key: currentQuestion.field, question: currentQuestion.question }
    : null;

  const getMissingFields = () => {
    const missing = [];
    if (!passport.material) missing.push({ key: 'material', priority: 1, question: 'What material is your product made of?' });
    if (!passport.weight) missing.push({ key: 'weight', priority: 2, question: 'What is the total weight for shipping purposes?' });
    return missing.sort((a, b) => a.priority - b.priority);
  };

  const missingFields = getMissingFields();

  const startInterview = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/api/interview/start`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to start interview');
      }

      const data = await response.json();
      setSession(data.session);
      setPassport(normalizePassport(data.passport));
      setStep(0);
    } catch (err) {
      console.error(err);
      setError('Unable to connect to the API. Please make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    startInterview();
  }, []);

  const handleUpdate = async () => {
    if (!inputValue.trim() || !currentQuestion) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/api/interview/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ raw_transcript: inputValue.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit answer');
      }

      const data = await response.json();
      setSession(data.session);
      setPassport(normalizePassport(data.passport));
      setInputValue('');
      setStep((prev) => prev + 1);
    } catch (err) {
      console.error(err);
      setError('The answer could not be submitted. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section-padding voice-interview-section" id="voice">
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h2>Voice Product Interview</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '18px' }}>
          Never ask what you already know. Priority-based missing data collection.
        </p>
      </div>

      {error && (
        <div style={{ marginBottom: '20px', padding: '12px 16px', borderRadius: '12px', background: '#fff1f2', color: '#9f1239', border: '1px solid #fecdd3' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
        <div className="card" style={{ background: 'var(--color-white)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', borderBottom: '1px solid #f3f4f6', paddingBottom: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--color-deep-green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Mic color="white" />
            </div>
            <div>
              <h3 style={{ fontSize: '18px' }}>Data Collection Assistant</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                {loading ? 'Processing response...' : 'Assessing Product Passport...'}
              </p>
            </div>
          </div>

          <div style={{ minHeight: '200px', display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            {step > 0 && (
              <>
                <div style={{ background: '#f3f4f6', padding: '12px 16px', borderRadius: '16px 16px 16px 0', alignSelf: 'flex-start', maxWidth: '80%' }}>
                  What material is your product made of?
                </div>
                <div style={{ background: 'var(--color-orange)', color: 'var(--color-deep-green)', padding: '12px 16px', borderRadius: '16px 16px 0 16px', alignSelf: 'flex-end', maxWidth: '80%' }}>
                  {passport.material}
                </div>
              </>
            )}

            {step > 1 && (
              <>
                <div style={{ background: '#f3f4f6', padding: '12px 16px', borderRadius: '16px 16px 16px 0', alignSelf: 'flex-start', maxWidth: '80%' }}>
                  What is the total weight for shipping purposes?
                </div>
                <div style={{ background: 'var(--color-orange)', color: 'var(--color-deep-green)', padding: '12px 16px', borderRadius: '16px 16px 0 16px', alignSelf: 'flex-end', maxWidth: '80%' }}>
                  {passport.weight}
                </div>
              </>
            )}

            {currentTarget && (
              <div style={{ background: '#f3f4f6', padding: '12px 16px', borderRadius: '16px 16px 16px 0', alignSelf: 'flex-start', maxWidth: '80%', animation: 'fadeIn 0.5s ease-in' }}>
                {currentTarget.question}
              </div>
            )}

            {!currentTarget && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#16a34a', fontWeight: '500', justifyContent: 'center', marginTop: '20px' }}>
                <CheckCircle2 /> Product Passport Complete!
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              placeholder={currentTarget ? 'Type answer...' : 'Interview complete.'}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={!currentTarget || loading}
              onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
              style={{ flex: 1, padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: '9999px', outline: 'none' }}
            />
            <button
              className="btn-primary"
              style={{ padding: '12px', borderRadius: '50%' }}
              onClick={handleUpdate}
              disabled={!currentTarget || loading}
            >
              <Send size={18} />
            </button>
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '24px', marginBottom: '24px' }}>Logic Flow</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-deep-green)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</div>
              <p style={{ fontWeight: '500' }}>Check passport completeness</p>
            </div>
            <div style={{ borderLeft: '2px solid #e5e7eb', marginLeft: '15px', paddingLeft: '32px', paddingBottom: '16px' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                Missing: {missingFields.map((f) => f.key).join(', ') || 'None'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', opacity: currentTarget ? 1 : 0.5 }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-deep-green)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</div>
              <p style={{ fontWeight: '500' }}>Prioritize missing fields</p>
            </div>
            <div style={{ borderLeft: '2px solid #e5e7eb', marginLeft: '15px', paddingLeft: '32px', paddingBottom: '16px' }}>
              {currentTarget ? (
                <span style={{ fontSize: '14px', color: 'var(--color-orange)', fontWeight: 'bold' }}>
                  Target: {currentTarget.key}
                </span>
              ) : (
                <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>All caught up</span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', opacity: currentTarget ? 1 : 0.5 }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-deep-green)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</div>
              <p style={{ fontWeight: '500' }}>Ask most useful question</p>
            </div>

            <div style={{ borderLeft: '2px solid transparent', marginLeft: '15px', paddingLeft: '32px', paddingTop: '16px' }}>
              {latestHistory?.completeness_before !== undefined && (
                <div style={{ marginBottom: '16px', padding: '12px 16px', borderRadius: '12px', background: '#f7f5ed', color: 'var(--color-deep-green)', fontSize: '14px' }}>
                  {latestHistory.completeness_before.toFixed(0)}% complete {'->'} answered {latestHistory.field} {'->'} {latestHistory.completeness_after?.toFixed(0) ?? latestHistory.completeness_before.toFixed(0)}% complete
                </div>
              )}
              <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>LIVE PASSPORT DATA</div>
                <pre style={{ margin: 0, fontSize: '12px', color: 'var(--color-deep-green)' }}>
                  {JSON.stringify(passport, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
