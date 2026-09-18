import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'https://servfixy-production.up.railway.app';

const fmtCurrency = (v) => '$' + Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtStatus   = (s) => (s || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
const fmtDate     = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const AGING_COLOR  = { '30-60': '#d97706', '61-90': '#ea580c', '91-120': '#dc2626', '120+': '#dc2626' };
const AGING_BG     = { '30-60': '#fefce8', '61-90': '#fff7ed', '91-120': '#fef2f2', '120+': '#fef2f2' };
const STATUS_COLOR = {
  active: '#1d4ed8', notice_issued: '#d97706', filed_with_attorney: '#ea580c',
  fed: '#f97316', writ_filed: '#dc2626', hearing_scheduled: '#7c3aed',
  possession_granted: '#15803d', closed_paid: '#15803d', closed_written_off: '#94a3b8'
};

// ── Login ──────────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const doLogin = async (em, pw) => {
    setError(''); setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: em, password: pw })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      if (data.user.role !== 'owner' && data.user.role !== 'admin') {
        throw new Error('Access denied. Owner accounts only.');
      }
      localStorage.setItem('co_token', data.token);
      localStorage.setItem('co_user', JSON.stringify(data.user));
      onLogin(data.user, data.token);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleDemoLogin = () => {
    const e = 'james@servfixy.com', p = 'password';
    setEmail(e); setPassword(p); doLogin(e, p);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', fontFamily: "'Inter', system-ui, sans-serif", padding: '8px 16px' }}>
      <div style={{ width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {/* Logo */}
        <img src="/servfixy-logo.png" alt="Servfixy" style={{ width: '420px', marginBottom: '16px', objectFit: 'contain' }} />

        {/* Heading */}
        <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#111827', marginBottom: '28px', alignSelf: 'flex-start' }}>Owner</h1>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '12px', borderRadius: '10px', marginBottom: '16px', fontSize: '13px', width: '100%', boxSizing: 'border-box' }}>
            {error}
          </div>
        )}

        {/* Email */}
        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && doLogin(email, password)}
          placeholder="you@example.com"
          style={{ width: '100%', padding: '14px 18px', border: 'none', borderRadius: '12px', fontSize: '14px', backgroundColor: '#EEF2F7', boxSizing: 'border-box', marginBottom: '14px', outline: 'none' }} />

        {/* Password */}
        <input type="password" value={password} onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && doLogin(email, password)}
          placeholder="••••••••"
          style={{ width: '100%', padding: '14px 18px', border: 'none', borderRadius: '12px', fontSize: '14px', backgroundColor: '#EEF2F7', boxSizing: 'border-box', marginBottom: '24px', outline: 'none' }} />

        {/* Buttons */}
        <div style={{ alignSelf: 'flex-start', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button onClick={() => doLogin(email, password)} disabled={loading}
            style={{ padding: '13px 28px', backgroundColor: '#14B8A6', color: 'white', border: 'none', borderRadius: '50px', fontSize: '15px', fontWeight: '700', cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
          <button onClick={handleDemoLogin} disabled={loading}
            style={{ padding: '13px 20px', borderRadius: '50px', border: '2px solid #14B8A6', background: 'transparent', color: '#0f766e', fontSize: '14px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '13px' }}>▶</span> Investor Demo
          </button>
        </div>

      </div>
    </div>
  );
}

// ── Property Card ─────────────────────────────────────────────────────────────
function PropertyCard({ prop, onSelect, selected }) {
  const delinqRate = prop.unit_count ? ((prop.case_count / prop.unit_count) * 100).toFixed(1) : '—';
  return (
    <div onClick={() => onSelect(prop)} style={{
      backgroundColor: '#fff', borderRadius: '12px', padding: '20px',
      border: selected ? '2px solid #1d4ed8' : '1px solid #e2e8f0',
      boxShadow: selected ? '0 0 0 3px #dbeafe' : '0 1px 4px rgba(0,0,0,0.06)',
      cursor: 'pointer', transition: 'all 0.15s'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
        <div>
          <div style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', marginBottom: '3px' }}>{prop.name}</div>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>{prop.city}, {prop.state} · {prop.unit_count} units</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#dc2626' }}>{fmtCurrency(prop.total_balance)}</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>Total Delinquent</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        {[
          { label: 'Cases',        value: prop.case_count,   color: '#1d4ed8' },
          { label: 'In Legal',     value: prop.legal_count,  color: '#ea580c' },
          { label: 'Delinq. Rate', value: `${delinqRate}%`,  color: '#7c3aed' },
        ].map((k, i) => (
          <div key={i} style={{ backgroundColor: '#f8fafc', borderRadius: '8px', padding: '8px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '16px', fontWeight: '800', color: k.color }}>{k.value}</div>
            <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>{k.label}</div>
          </div>
        ))}
      </div>
      {/* Aging bar */}
      {prop.aging && prop.aging.length > 0 && (
        <div style={{ marginTop: '14px' }}>
          <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Aging Breakdown</div>
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
            {prop.aging.map((a, i) => (
              <div key={i} style={{ padding: '3px 9px', borderRadius: '5px', backgroundColor: AGING_BG[a.aging_bucket] || '#f8fafc', border: `1px solid ${AGING_COLOR[a.aging_bucket] || '#e2e8f0'}`, fontSize: '11px', fontWeight: '600', color: AGING_COLOR[a.aging_bucket] || '#475569' }}>
                {a.aging_bucket}d · {a.count}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Case Row ──────────────────────────────────────────────────────────────────
function CaseRow({ c }) {
  return (
    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
      <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>{c.resident_name}</td>
      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>Unit {c.unit_number}</td>
      <td style={{ padding: '12px 16px' }}>
        <span style={{ padding: '3px 9px', borderRadius: '5px', backgroundColor: AGING_BG[c.aging_bucket] || '#f8fafc', color: AGING_COLOR[c.aging_bucket] || '#475569', fontSize: '11px', fontWeight: '700', border: `1px solid ${AGING_COLOR[c.aging_bucket] || '#e2e8f0'}` }}>
          {c.aging_bucket}d
        </span>
      </td>
      <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: '#dc2626' }}>{fmtCurrency(c.balance_owed)}</td>
      <td style={{ padding: '12px 16px' }}>
        <span style={{ padding: '3px 9px', borderRadius: '5px', backgroundColor: '#f8fafc', color: STATUS_COLOR[c.status] || '#475569', fontSize: '11px', fontWeight: '600', border: '1px solid #e2e8f0' }}>
          {fmtStatus(c.status)}
        </span>
      </td>
      <td style={{ padding: '12px 16px', fontSize: '12px', color: '#94a3b8' }}>{c.attorney_name || '—'}</td>
      <td style={{ padding: '12px 16px', fontSize: '12px', color: '#94a3b8' }}>{fmtDate(c.notice_issued_date)}</td>
    </tr>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
// ── AI Reports Tab ───────────────────────────────────────────────────────────
function AIReportsTab({ user, token, properties, allCases }) {
  const [query, setQuery]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);
  const [history, setHistory]   = useState([]);
  const textareaRef             = React.useRef(null);

  const SUGGESTIONS = [
    'Show all cases over $3,000',
    'Which properties are getting worse month over month?',
    'List every case in legal pipeline by property',
    'Show high risk residents — 91+ days with no notice issued',
    'Compare delinquency rates across all properties',
    'What is my total exposure by aging bucket?',
  ];

  const buildContext = () => {
    const propSummaries = properties.map(p => ({
      name: p.name, city: p.city, state: p.state, units: p.unit_count,
      active_cases: p.case_count, legal_cases: p.legal_count,
      total_balance: p.total_balance,
      aging: p.aging
    }));
    const caseRows = allCases
      .filter(c => !['closed_paid','closed_written_off'].includes(c.status))
      .map(c => ({
        resident: c.resident_name, unit: c.unit_number,
        property: c.property_name || properties.find(p=>p.id===c.property_id)?.name || '',
        balance: Number(c.balance_owed), aging: c.aging_bucket,
        status: c.status, attorney: c.attorney_name || null,
        notice_date: c.notice_issued_date || null, times_late: c.times_late
      }));
    return { properties: propSummaries, cases: caseRows };
  };

  const handleAsk = async (q) => {
    const question = (q || query).trim();
    if (!question) return;
    setLoading(true); setResult(null);
    const ctx = buildContext();
    const prompt = `You are a collections analytics assistant for a multifamily property management company.
The owner has ${ctx.properties.length} properties and ${ctx.cases.length} active delinquency cases.

PORTFOLIO DATA:
${JSON.stringify(ctx.properties, null, 2)}

ACTIVE CASES (${ctx.cases.length} total):
${JSON.stringify(ctx.cases, null, 2)}

OWNER QUESTION: "${question}"

Respond with a clear, structured answer. Use markdown-style formatting:
- Use **bold** for key numbers and property names
- Use bullet lists for case lists
- Lead with a one-line summary answer
- Then provide the detail
- If listing cases, include: resident name, unit, property, balance, status, aging bucket
- Keep it concise and actionable — this is an executive owner view
- Do not make up data. Only use what is provided above.`;

    try {
      const res = await fetch(`${API_URL}/api/ai/collections-query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI request failed');
      const text = data.text || 'No response.';
      const entry = { question, answer: text, ts: new Date() };
      setResult(entry);
      setHistory(h => [entry, ...h.slice(0, 4)]);
      setQuery('');
    } catch (err) {
      setResult({ question, answer: 'Error: ' + err.message, ts: new Date() });
    } finally {
      setLoading(false);
    }
  };

  // Simple markdown renderer
  const renderAnswer = (text) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      if (line.startsWith('- ') || line.startsWith('* ')) {
        const inner = line.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '4px', paddingLeft: '8px' }}>
          <span style={{ color: '#1d4ed8', flexShrink: 0 }}>·</span>
          <span dangerouslySetInnerHTML={{ __html: inner }} style={{ fontSize: '13px', color: '#1e293b', lineHeight: '1.6' }} />
        </div>;
      }
      if (line.trim() === '') return <div key={i} style={{ height: '8px' }} />;
      const inner = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return <p key={i} dangerouslySetInnerHTML={{ __html: inner }} style={{ fontSize: '13px', color: '#1e293b', lineHeight: '1.6', marginBottom: '4px' }} />;
    });
  };

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 24px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>AI Portfolio Reports</h2>
      <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '28px' }}>Ask anything about your delinquency data — cases, trends, comparisons, risk.</p>

      {/* Input box */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', padding: '20px', marginBottom: '20px' }}>
        <textarea
          ref={textareaRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAsk(); } }}
          placeholder="Ask anything... e.g. 'Which property has the highest delinquency rate?' or 'List all cases over $5,000 in legal pipeline'"
          rows={3}
          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', color: '#0f172a', resize: 'none', outline: 'none', fontFamily: 'Arial, sans-serif', lineHeight: '1.5' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>Press Enter to ask · Shift+Enter for new line</span>
          <button onClick={() => handleAsk()} disabled={loading || !query.trim()}
            style={{ padding: '10px 22px', borderRadius: '8px', border: 'none', background: loading || !query.trim() ? '#93c5fd' : '#1d4ed8', color: '#fff', fontSize: '14px', fontWeight: '700', cursor: loading || !query.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {loading ? <><span style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid #fff', borderTopColor: 'transparent', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Analyzing...</> : 'Ask AI'}
          </button>
        </div>
      </div>

      {/* Suggestion chips */}
      {!result && !loading && (
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '10px' }}>Try asking</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {SUGGESTIONS.map((s, i) => (
              <button key={i} onClick={() => { setQuery(s); handleAsk(s); }}
                style={{ padding: '7px 14px', borderRadius: '20px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#475569', fontSize: '12px', cursor: 'pointer', transition: 'all 0.15s' }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '32px', textAlign: 'center' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '3px solid #dbeafe', borderTopColor: '#1d4ed8', animation: 'spin 0.7s linear infinite', margin: '0 auto 12px' }} />
          <div style={{ fontSize: '13px', color: '#475569' }}>Analyzing your portfolio data...</div>
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden', marginBottom: '20px' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#1d4ed8' }}>"{result.question}"</div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>{result.ts.toLocaleTimeString()}</div>
          </div>
          <div style={{ padding: '20px 24px' }}>
            {renderAnswer(result.answer)}
          </div>
          <div style={{ padding: '12px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '10px' }}>
            <button onClick={() => { setResult(null); setQuery(''); }}
              style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: 'transparent', color: '#475569', fontSize: '12px', cursor: 'pointer' }}>
              Ask another question
            </button>
            <button onClick={() => {
              const text = result.question + '\n\n' + result.answer;
              navigator.clipboard.writeText(text).catch(() => {});
            }}
              style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: 'transparent', color: '#475569', fontSize: '12px', cursor: 'pointer' }}>
              Copy
            </button>
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 1 && (
        <div>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '10px' }}>Previous Questions</div>
          {history.slice(1).map((h, i) => (
            <div key={i} onClick={() => setResult(h)}
              style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '12px 16px', marginBottom: '8px', cursor: 'pointer' }}>
              <div style={{ fontSize: '13px', color: '#1d4ed8', marginBottom: '3px' }}>"{h.question}"</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.answer.slice(0, 100)}...</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard({ user, token, onLogout }) {
  const [properties, setProperties]   = useState([]);
  const [allCases, setAllCases]       = useState([]);
  const [selectedProp, setSelectedProp] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [activeTab, setActiveTab]     = useState('overview');

  const h = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Load all properties this owner has access to
        const propRes = await fetch(`${API_URL}/api/properties`, { headers: h });
        const propData = await propRes.json();
        const props = Array.isArray(propData) ? propData : [];

        // Load all collections cases
        const caseRes = await fetch(`${API_URL}/api/collections/cases`, { headers: h });
        const caseData = await caseRes.json();
        const cases = Array.isArray(caseData) ? caseData : [];
        setAllCases(cases);

        // Scope to owner's property_ids if not admin
        const ownedIds = user.property_ids && user.property_ids.length > 0
          ? new Set(user.property_ids)
          : new Set(props.map(p => p.id)); // admin sees all

        const ownedProps = props.filter(p => ownedIds.has(p.id));
        const ownedCases = cases.filter(c => ownedIds.has(c.property_id));

        // Build per-property summaries
        const LEGAL = new Set(['filed_with_attorney','fed','writ_filed','hearing_scheduled','possession_granted']);
        const summarized = ownedProps.map(p => {
          const pc = ownedCases.filter(c => c.property_id === p.id && !['closed_paid','closed_written_off'].includes(c.status));
          const aging = ['30-60','61-90','91-120','120+'].map(b => ({
            aging_bucket: b,
            count: pc.filter(c => c.aging_bucket === b).length
          })).filter(a => a.count > 0);
          return {
            ...p,
            case_count:    pc.length,
            legal_count:   pc.filter(c => LEGAL.has(c.status)).length,
            total_balance: pc.reduce((s, c) => s + Number(c.balance_owed || 0), 0),
            aging,
          };
        }).sort((a, b) => b.total_balance - a.total_balance);

        setProperties(summarized);
        if (summarized.length > 0) setSelectedProp(summarized[0]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  // Portfolio totals
  const totals = properties.reduce((acc, p) => ({
    balance:  acc.balance  + p.total_balance,
    cases:    acc.cases    + p.case_count,
    legal:    acc.legal    + p.legal_count,
  }), { balance: 0, cases: 0, legal: 0 });

  // Cases for selected property
  const visibleCases = allCases.filter(c =>
    selectedProp && c.property_id === selectedProp.id &&
    !['closed_paid','closed_written_off'].includes(c.status) &&
    (statusFilter === '' || c.status === statusFilter)
  );

  const STATUSES = ['active','notice_issued','filed_with_attorney','fed','writ_filed','hearing_scheduled','possession_granted'];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'Arial, sans-serif' }}>
      {/* Top Nav */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/servfixy-logo.png" alt="Servfixy" style={{ height: '28px', objectFit: 'contain' }} />
          <div style={{ background: '#1d4ed8', borderRadius: '5px', padding: '2px 8px', fontSize: '10px', fontWeight: '700', color: '#fff', letterSpacing: '0.08em' }}>COLLECTIONS</div>

        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '13px', color: '#475569' }}>{user.first_name || user.email}</span>
          <button onClick={onLogout} style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: 'transparent', color: '#94a3b8', fontSize: '12px', cursor: 'pointer' }}>Sign Out</button>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 32px', display: 'flex', gap: '0' }}>
        {[{ key: 'overview', label: 'Overview' }, { key: 'reports', label: '✦ AI Reports' }].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            style={{ padding: '14px 20px', border: 'none', borderBottom: activeTab === tab.key ? '2px solid #1d4ed8' : '2px solid transparent', backgroundColor: 'transparent', color: activeTab === tab.key ? '#1d4ed8' : '#94a3b8', fontSize: '13px', fontWeight: activeTab === tab.key ? '700' : '400', cursor: 'pointer', transition: 'all 0.15s' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'reports' && <AIReportsTab user={user} token={token} properties={properties} allCases={allCases} />}

      {activeTab === 'overview' && <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Portfolio KPI bar */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>Portfolio Overview</h1>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', maxWidth: '600px' }}>
            {[
              { label: 'Total Delinquent Balance', value: fmtCurrency(totals.balance), color: '#dc2626' },
              { label: 'Active Cases',             value: totals.cases,                color: '#1d4ed8' },
              { label: 'In Legal Pipeline',        value: totals.legal,                color: '#ea580c' },
            ].map((k, i) => (
              <div key={i} style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: '22px', fontWeight: '800', color: k.color }}>{k.value}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>{k.label}</div>
              </div>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8', fontSize: '14px' }}>Loading your portfolio...</div>
        ) : error ? (
          <div style={{ color: '#dc2626', fontSize: '13px' }}>{error}</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '24px', alignItems: 'start' }}>

            {/* Left — Property list */}
            <div>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
                Your Properties ({properties.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {properties.map(p => (
                  <PropertyCard key={p.id} prop={p} onSelect={setSelectedProp} selected={selectedProp?.id === p.id} />
                ))}
              </div>
            </div>

            {/* Right — Case detail for selected property */}
            {selectedProp && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>{selectedProp.name}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{selectedProp.case_count} active cases · {fmtCurrency(selectedProp.total_balance)} total delinquent</div>
                  </div>
                  <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: '7px', border: '1px solid #e2e8f0', backgroundColor: '#fff', color: '#1e293b', fontSize: '13px' }}>
                    <option value="">All Statuses</option>
                    {STATUSES.map(s => <option key={s} value={s}>{fmtStatus(s)}</option>)}
                  </select>
                </div>

                <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                  {visibleCases.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>No active cases for this property.</div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            {['Resident','Unit','Aging','Balance','Status','Attorney','Notice Issued'].map(h => (
                              <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {visibleCases.sort((a, b) => Number(b.balance_owed) - Number(a.balance_owed)).map(c => (
                            <CaseRow key={c.id} c={c} />
                          ))}
                        </tbody>
                        <tfoot>
                          <tr style={{ backgroundColor: '#f8fafc', borderTop: '2px solid #e2e8f0' }}>
                            <td colSpan={3} style={{ padding: '10px 16px', fontSize: '12px', fontWeight: '700', color: '#475569' }}>{visibleCases.length} cases</td>
                            <td style={{ padding: '10px 16px', fontSize: '13px', fontWeight: '800', color: '#dc2626' }}>
                              {fmtCurrency(visibleCases.reduce((s, c) => s + Number(c.balance_owed || 0), 0))}
                            </td>
                            <td colSpan={3} />
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>}
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
function App() {
  const [user,  setUser]  = useState(() => { try { return JSON.parse(localStorage.getItem('co_user')); } catch { return null; } });
  const [token, setToken] = useState(() => localStorage.getItem('co_token') || '');

  const handleLogin  = (u, t) => { setUser(u); setToken(t); };
  const handleLogout = () => { localStorage.removeItem('co_token'); localStorage.removeItem('co_user'); setUser(null); setToken(''); };

  if (!user || !token) return <Login onLogin={handleLogin} />;
  return <Dashboard user={user} token={token} onLogout={handleLogout} />;
}

export default App;
