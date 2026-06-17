import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoneyHealthScore } from '../components/MoneyHealthScore';
import { Target, Activity, TrendingUp, X, Calculator, Building, AlertTriangle, Lightbulb, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type Insight = {
  _id: string;
  title: string;
  description: string;
  reason: string;
  type: 'warning' | 'opportunity' | 'success' | 'info';
  category: string;
};

export default function Dashboard() {
  const { portfolio, userKey } = useAuth();
  const navigate = useNavigate();
  const SCORE_KEY = userKey('health_score');

  // Persist wizard completion so it doesn't repeat every login
  const savedScore = Number(localStorage.getItem(SCORE_KEY) || '0');
  const [showWizard, setShowWizard] = useState(!savedScore);
  const [healthScore, setHealthScore] = useState<number | null>(savedScore || null);

  const [showInsuranceModal, setShowInsuranceModal] = useState(false);
  const [insuranceForm, setInsuranceForm] = useState({ income: 1500000, loans: 500000, age: 30 });
  const [idealCover, setIdealCover] = useState<number | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      const token = localStorage.getItem('mentorai_token');
      if (!token) return;
      try {
        const res = await fetch('/api/insights', { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setInsights(await res.json());
      } catch (err) {
        console.error(err);
      }
    };
    fetchInsights();
  }, [portfolio]);

  const dismissInsight = async (id: string) => {
    setInsights(insights.filter(i => i._id !== id));
    const token = localStorage.getItem('mentorai_token');
    if (token) {
      await fetch(`/api/insights/${id}/dismiss`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
    }
  };

  const calculateCover = (e: React.FormEvent) => {
    e.preventDefault();
    const cover = (insuranceForm.income * 15) + insuranceForm.loans;
    setIdealCover(cover);
  };

  const handleWizardComplete = (score: number) => {
    setHealthScore(score);
    localStorage.setItem(SCORE_KEY, String(score));
    setShowWizard(false);
  };

  if (showWizard) {
    return (
      <div className="animate-fade-in-up" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ marginBottom: '1rem' }}>Welcome to <span className="text-gradient">MentorAI</span></h1>
        <p style={{ marginBottom: '3rem', fontSize: '1.2rem' }}>Let's establish your baseline Money Health Score. It takes 2 minutes.</p>
        <MoneyHealthScore onComplete={handleWizardComplete} />
      </div>
    );
  }

  // Dashboard View after Onboarding
  const scoreCategory = healthScore && healthScore > 75 ? 'Excellent' : healthScore && healthScore > 50 ? 'Good' : 'Needs Work';
  const scoreColor = healthScore && healthScore > 75 ? 'var(--secondary)' : healthScore && healthScore > 50 ? '#fbbf24' : 'var(--accent)';

  return (
    <div className="animate-fade-in-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h1>Your Financial <span className="text-gradient">Command Center</span></h1>
          <p style={{ marginTop: '0.5rem', fontSize: '1.1rem' }}>Your financial snapshot is verified. Here's what to do next.</p>
        </div>
        <button
          className="btn btn-outline"
          onClick={() => { setShowInsuranceModal(true); setIdealCover(null); }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
        >
          <Calculator size={18} /> Insurance Calculator
        </button>
      </div>

      <div className="dashboard-grid">
        {/* Main Score Card */}
        <div className="glass-panel stagger-1" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-50px', right: '-50px', opacity: 0.1 }}>
            <Activity size={200} />
          </div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={20} color={scoreColor} />
            Money Health Score
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginTop: '1.5rem' }}>
            <div className="score-circle" style={{ borderColor: scoreColor, margin: '1rem 0', boxShadow: `0 0 30px ${scoreColor}40` }}>
              <span className="score-value">{healthScore}</span>
            </div>
            <div>
              <h2 style={{ color: scoreColor, marginBottom: '0.5rem' }}>{scoreCategory}</h2>
              <p>You are in the top 15% of savers on platform. Your emergency fund is strong.</p>
            </div>
          </div>
        </div>

        {/* Net Worth Tracker */}
        <div className="glass-panel stagger-2">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} className="text-gradient-primary" />
              Net Worth Estimator
            </h3>
            {portfolio?.bankConnected && (
              <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.2)', color: 'var(--secondary)', padding: '0.2rem 0.6rem', borderRadius: '99px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Building size={12} /> {portfolio.bankName} Connected
              </span>
            )}
          </div>
          <h2 style={{ marginTop: '1.5rem', fontSize: '3rem' }}>
            {portfolio?.bankConnected && portfolio.totalCorpus
              ? `₹${(portfolio.totalCorpus / 100000).toFixed(2)}L`
              : 'Connect Bank'}
          </h2>
          <p className="trend positive" style={{ marginTop: '1rem' }}>
            {portfolio?.bankConnected ? `+₹${(portfolio.sipAmount / 1000).toFixed(1)}k sip/month` : 'Connect bank to sync auto-deposits'}
          </p>
          <div style={{ marginTop: '1.5rem', height: '4px', background: 'var(--bg-light-elem)', borderRadius: '4px' }}>
            <div style={{ width: portfolio?.bankConnected ? `${Math.min((portfolio.totalCorpus / 10000000) * 100, 100)}%` : '0%', height: '100%', background: 'var(--primary)', borderRadius: '4px', transition: 'width 1s ease' }}></div>
          </div>
          <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
            {portfolio?.bankConnected ? `${((portfolio.totalCorpus / 10000000) * 100).toFixed(0)}% to ₹1Cr Milestone` : 'Waiting for sync...'}
          </p>
        </div>

        {/* Active AI Tasks via Insights Engine */}
        <div className="glass-panel stagger-3" style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Target size={20} color="var(--accent)" />
              AI Insights Engine
            </h3>
            {insights.length > 0 && (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{insights.length} Active Rules Triggered</span>
            )}
          </div>

          {insights.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              {portfolio?.bankConnected
                ? "Your portfolio is fully optimized! No critical insights at this moment."
                : "Connect your bank account to generate personalized insights."}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {insights.map(insight => {
                let icon, tagColor, tagBg, tagText;
                if (insight.type === 'warning') {
                  icon = <AlertTriangle color="var(--accent)" size={24} />;
                  tagColor = 'var(--accent)'; tagBg = 'rgba(244, 63, 94, 0.15)'; tagText = 'High Priority';
                } else if (insight.type === 'opportunity') {
                  icon = <Lightbulb color="var(--secondary)" size={24} />;
                  tagColor = 'var(--secondary)'; tagBg = 'rgba(16, 185, 129, 0.15)'; tagText = 'Opportunity';
                } else {
                  icon = <CheckCircle2 color="var(--primary)" size={24} />;
                  tagColor = 'var(--primary)'; tagBg = 'var(--primary-light)'; tagText = 'Milestone';
                }

                return (
                  <div key={insight._id} className="action-card animate-fade-in-up" style={{ background: 'var(--bg-light-elem)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      {icon}
                      <span style={{ fontSize: '0.8rem', background: tagBg, color: tagColor, padding: '0.2rem 0.6rem', borderRadius: '99px', fontWeight: 600 }}>{tagText}</span>
                    </div>
                    <p style={{ fontSize: '0.95rem', marginBottom: '1rem', lineHeight: 1.5, color: 'var(--text-muted)' }}>{insight.description}</p>

                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', overflow: 'hidden' }}>
                      <button
                        onClick={() => setExpandedInsight(expandedInsight === insight._id ? null : insight._id)}
                        style={{ width: '100%', padding: '0.75rem 1rem', background: 'transparent', border: 'none', color: 'var(--text-main)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontSize: '0.85rem' }}
                      >
                        <strong style={{ opacity: 0.8 }}>Why this matters? (AI Explainability)</strong>
                        {expandedInsight === insight._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      {expandedInsight === insight._id && (
                        <div style={{ padding: '0 1rem 1rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, animation: 'fadeIn 0.2s ease-in-out' }}>
                          {insight.reason}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                      {insight.category === 'emergency_fund' && <button className="btn btn-outline" style={{ flex: 1, padding: '0.5rem' }}>Explore Liquids</button>}
                      {insight.category === 'tax' && <button className="btn btn-primary" style={{ flex: 1, padding: '0.5rem' }} onClick={() => navigate('/tax-wizard')}>Run Tax Wizard</button>}
                      {insight.category === 'overlap' && <button className="btn btn-primary" style={{ flex: 1, padding: '0.5rem' }} onClick={() => navigate('/mf-xray')}>Run X-Ray</button>}

                      <button className="btn" onClick={() => dismissInsight(insight._id)} style={{ flex: 1, padding: '0.5rem', border: '1px solid var(--glass-border)', background: 'transparent' }}>Dismiss</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Insurance Calculator Modal */}
      {showInsuranceModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', backgroundColor: 'var(--bg-light)', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem' }}><Calculator color="var(--accent)" size={24} /> Term Insurance Calculator</h2>
              <button onClick={() => setShowInsuranceModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>

            {idealCover === null ? (
              <form onSubmit={calculateCover} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Annual Income (₹)</label>
                  <input type="number" value={insuranceForm.income} onChange={e => setInsuranceForm({ ...insuranceForm, income: Number(e.target.value) })} required style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', background: 'var(--bg-light-elem)', color: 'var(--text-main)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Outstanding Loans (₹)</label>
                  <input type="number" value={insuranceForm.loans} onChange={e => setInsuranceForm({ ...insuranceForm, loans: Number(e.target.value) })} required style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', background: 'var(--bg-light-elem)', color: 'var(--text-main)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Current Age</label>
                  <input type="number" value={insuranceForm.age} onChange={e => setInsuranceForm({ ...insuranceForm, age: Number(e.target.value) })} required style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', background: 'var(--bg-light-elem)', color: 'var(--text-main)' }} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }}>Calculate Need</button>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '1rem' }}>Recommended Cover</h3>
                <h2 style={{ fontSize: '2.5rem', color: 'var(--accent)', marginBottom: '1rem' }}>
                  ₹{((idealCover || 0) / 10000000).toFixed(2)} Cr
                </h2>
                <div style={{ background: 'var(--bg-light-elem)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', textAlign: 'left' }}>
                  <ul style={{ paddingLeft: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <li>15x your annual income (₹{(insuranceForm.income * 15 / 10000000).toFixed(2)} Cr)</li>
                    <li>Coverage for outstanding loans (₹{(insuranceForm.loans / 100000).toFixed(2)} L)</li>
                  </ul>
                </div>
                <button onClick={() => { setShowInsuranceModal(false); setIdealCover(null); }} className="btn btn-primary" style={{ width: '100%' }}>Got It</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
