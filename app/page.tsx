'use client';
import { useState, useEffect } from 'react';

interface Proposal {
  id?: string;
  venue_name: string;
  location: string;
  estimated_cost: string;
  why_it_fits: string;
  user_query?: string;
  created_at?: string;
}

const EXAMPLES = [
  '10-person leadership retreat in the mountains, 3 days, $4k budget',
  '50-person team building in Austin TX, 1 day, $8k budget',
  '200-person annual conference in NYC, 2 days, $50k budget',
  '20-person product offsite near beach, 4 days, $15k budget',
];

export default function Home() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState<Proposal | null>(null);
  const [history, setHistory] = useState<Proposal[]>([]);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch('/api/plan')
      .then(r => r.json())
      .then(data => setHistory(Array.isArray(data) ? data : []))
      .catch(() => setHistory([]));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim() || loading) return;
    setLoading(true);
    setError('');
    setCurrent(null);

    try {
      const res = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      setCurrent({ ...data, user_query: query });
      setHistory(prev => [{ ...data, user_query: query }, ...prev.slice(0, 19)]);
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  function useExample(ex: string) {
    setQuery(ex);
    setError('');
  }

  if (!mounted) return null;

  return (
    <main style={{ minHeight: '100vh', background: '#0a0a0f', fontFamily: "'DM Sans', sans-serif", color: '#e8e6e0' }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@400;500;600&display=swap" rel="stylesheet" />

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: #c8a96e33; }
        ::-webkit-scrollbar { width: 6px; } 
        ::-webkit-scrollbar-track { background: #0a0a0f; }
        ::-webkit-scrollbar-thumb { background: #2a2a35; border-radius: 3px; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .fade-up { animation: fadeUp 0.5s ease forwards; }
        .fade-up-1 { animation: fadeUp 0.5s 0.1s ease both; }
        .fade-up-2 { animation: fadeUp 0.5s 0.2s ease both; }
        .fade-up-3 { animation: fadeUp 0.5s 0.3s ease both; }

        .search-input {
          width: 100%;
          background: #12121a;
          border: 1px solid #2a2a38;
          border-radius: 14px;
          padding: 18px 22px;
          font-size: 16px;
          font-family: 'DM Sans', sans-serif;
          color: #e8e6e0;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          resize: none;
          line-height: 1.5;
        }
        .search-input:focus {
          border-color: #c8a96e;
          box-shadow: 0 0 0 3px #c8a96e18;
        }
        .search-input::placeholder { color: #4a4a5a; }

        .btn-primary {
          background: linear-gradient(135deg, #c8a96e, #e8c98e);
          color: #0a0a0f;
          border: none;
          border-radius: 12px;
          padding: 16px 32px;
          font-size: 15px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.1s;
          white-space: nowrap;
          letter-spacing: 0.01em;
        }
        .btn-primary:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .btn-primary:active:not(:disabled) { transform: translateY(0); }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

        .example-chip {
          background: #12121a;
          border: 1px solid #2a2a38;
          border-radius: 100px;
          padding: 8px 16px;
          font-size: 13px;
          color: #888;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
          font-family: 'DM Sans', sans-serif;
        }
        .example-chip:hover { border-color: #c8a96e66; color: #c8a96e; background: #c8a96e0a; }

        .proposal-card {
          background: linear-gradient(135deg, #14141e, #1a1a28);
          border: 1px solid #c8a96e44;
          border-radius: 20px;
          padding: 32px;
          position: relative;
          overflow: hidden;
        }
        .proposal-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, #c8a96e66, transparent);
        }

        .history-card {
          background: #0f0f18;
          border: 1px solid #1e1e2a;
          border-radius: 16px;
          padding: 22px 24px;
          transition: border-color 0.2s, background 0.2s;
          cursor: default;
        }
        .history-card:hover { border-color: #2a2a3a; background: #12121c; }

        .cost-badge {
          display: inline-block;
          background: #c8a96e18;
          border: 1px solid #c8a96e44;
          color: #c8a96e;
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.02em;
        }

        .location-tag {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: #666;
          font-size: 14px;
        }

        .spinner {
          width: 18px; height: 18px;
          border: 2px solid #0a0a0f44;
          border-top-color: #0a0a0f;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
        }

        .loading-bar {
          height: 2px;
          background: linear-gradient(90deg, transparent, #c8a96e, transparent);
          background-size: 200% auto;
          animation: shimmer 1.5s linear infinite;
          border-radius: 2px;
        }

        .section-title {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #444;
        }

        .divider {
          height: 1px;
          background: linear-gradient(90deg, #1e1e2a, transparent);
          margin: 40px 0;
        }
      `}</style>

      {/* Header */}
      <header style={{ borderBottom: '1px solid #1a1a24', padding: '20px 0' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg, #c8a96e, #e8c98e)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0a0a0f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 500, color: '#e8e6e0', letterSpacing: '0.01em' }}>Concierge</span>
          </div>
          <span style={{ fontSize: 12, color: '#333', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>AI · Event Planning</span>
        </div>
      </header>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '60px 24px 80px' }}>

        {/* Hero */}
        <div className="fade-up" style={{ marginBottom: 48, textAlign: 'center' }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 500, lineHeight: 1.15, marginBottom: 16, letterSpacing: '-0.01em' }}>
            Plan your perfect<br />
            <span style={{ background: 'linear-gradient(135deg, #c8a96e, #e8c98e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              corporate event
            </span>
          </div>
          <p style={{ color: '#666', fontSize: 17, lineHeight: 1.6, maxWidth: 480, margin: '0 auto' }}>
            Describe your event in plain English. Get an AI-curated venue proposal in seconds.
          </p>
        </div>

        {/* Search Form */}
        <div className="fade-up-1" style={{ marginBottom: 16 }}>
          <form onSubmit={handleSubmit}>
            <div style={{ position: 'relative', marginBottom: 12 }}>
              <textarea
                className="search-input"
                rows={3}
                placeholder="e.g. A 10-person leadership retreat in the mountains for 3 days with a $4k budget..."
                value={query}
                onChange={e => { setQuery(e.target.value); setError(''); }}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn-primary" disabled={loading || !query.trim()}>
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="spinner" /> Planning...
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                    </svg>
                    Get Proposal
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Loading bar */}
        {loading && <div className="loading-bar" style={{ marginBottom: 24 }} />}

        {/* Error */}
        {error && (
          <div style={{ background: '#1a0f0f', border: '1px solid #5a1a1a', borderRadius: 12, padding: '14px 18px', marginBottom: 24, color: '#e87878', fontSize: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </div>
        )}

        {/* Example chips */}
        {!current && !loading && (
          <div className="fade-up-2" style={{ marginBottom: 48 }}>
            <p className="section-title" style={{ marginBottom: 12 }}>Try an example</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {EXAMPLES.map((ex, i) => (
                <button key={i} className="example-chip" onClick={() => useExample(ex)}>{ex}</button>
              ))}
            </div>
          </div>
        )}

        {/* Current Proposal */}
        {current && !loading && (
          <div className="proposal-card fade-up" style={{ marginBottom: 48 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
              <div>
                <p className="section-title" style={{ marginBottom: 8, color: '#c8a96e88' }}>Venue Proposal</p>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 500, color: '#f0ece4', lineHeight: 1.2, marginBottom: 8 }}>
                  {current.venue_name}
                </h2>
                <span className="location-tag">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {current.location}
                </span>
              </div>
              <span className="cost-badge">{current.estimated_cost}</span>
            </div>

            <div style={{ height: 1, background: '#c8a96e18', margin: '20px 0' }} />

            <div>
              <p className="section-title" style={{ marginBottom: 10, color: '#c8a96e88' }}>Why it fits</p>
              <p style={{ color: '#b0ae9a', fontSize: 15, lineHeight: 1.75 }}>{current.why_it_fits}</p>
            </div>

            {current.user_query && (
              <div style={{ marginTop: 20, padding: '12px 16px', background: '#0a0a0f', borderRadius: 10, border: '1px solid #1a1a24' }}>
                <p style={{ fontSize: 13, color: '#444', fontStyle: 'italic' }}>"{current.user_query}"</p>
              </div>
            )}
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="fade-up-3">
            <div className="divider" />
            <p className="section-title" style={{ marginBottom: 20 }}>Previous searches ({history.length})</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {history.map((item, i) => (
                <div key={item.id || i} className="history-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontWeight: 500, color: '#d0cec8', fontSize: 16, marginBottom: 4 }}>{item.venue_name}</div>
                      <span className="location-tag" style={{ fontSize: 13 }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        {item.location}
                      </span>
                    </div>
                    <span style={{ fontSize: 12, color: '#c8a96e', background: '#c8a96e12', padding: '4px 10px', borderRadius: 100, border: '1px solid #c8a96e2a', whiteSpace: 'nowrap' }}>
                      {item.estimated_cost}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: '#555', lineHeight: 1.6 }}>{item.why_it_fits}</p>
                  {item.user_query && (
                    <p style={{ fontSize: 12, color: '#333', marginTop: 10, fontStyle: 'italic' }}>"{item.user_query}"</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {history.length === 0 && !current && !loading && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#2a2a3a' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" style={{ margin: '0 auto 12px', display: 'block' }}>
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <p style={{ fontSize: 14 }}>Your search history will appear here</p>
          </div>
        )}

      </div>
    </main>
  );
}