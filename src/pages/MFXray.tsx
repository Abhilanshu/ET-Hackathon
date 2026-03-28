import { useState } from 'react';
import { Search, UploadCloud, Cpu, AlertTriangle, CheckCircle, PieChart, Activity } from 'lucide-react';

export default function MFXray() {
  const [step, setStep] = useState<'upload' | 'scanning' | 'results'>('upload');
  const [mergeStep, setMergeStep] = useState<'idle' | 'processing' | 'done'>('idle');

  const handleUpload = () => {
    setStep('scanning');
    setTimeout(() => {
      setStep('results');
    }, 2500); // simulate MentorAI processing
  };

  if (step === 'scanning') {
    return (
      <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ position: 'relative' }}>
          <Cpu size={80} className="text-gradient-primary" style={{ animation: 'pulse 1.5s infinite' }} />
          <Activity size={32} color="var(--secondary)" style={{ position: 'absolute', bottom: -10, right: -10 }} />
        </div>
        <h2 style={{ marginTop: '2rem' }}>MentorAI is analyzing your CAS...</h2>
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Calculating true XIRR and fetching fund overlap matrices.</p>

        <div className="progress-bar" style={{ width: '300px', marginTop: '2rem' }}>
          <div className="progress-fill" style={{ width: '100%', animation: 'fillBar 2.5s ease-out forwards' }}></div>
        </div>
      </div>
    );
  }

  if (step === 'results') {
    return (
      <div className="animate-fade-in-up">
        <button onClick={() => setStep('upload')} className="btn btn-outline" style={{ marginBottom: '2rem' }}>
          &larr; Upload Another CAS
        </button>

        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1>Portfolio <span className="text-gradient">Diagnostics</span></h1>
          <p style={{ marginTop: '0.5rem', fontSize: '1.1rem' }}>Analyzed 8 mutual funds across your ₹45.2L portfolio.</p>
        </div>

        <div className="dashboard-grid">
          {/* Main XIRR */}
          <div className="glass-panel stagger-1" style={{ borderTop: '4px solid var(--primary)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>
              True XIRR
            </h3>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
              <h2 style={{ fontSize: '3rem' }}>14.8%</h2>
              <span style={{ background: 'rgba(244, 63, 94, 0.2)', color: 'var(--accent)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>-2.1% vs Nifty 50</span>
            </div>
            <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>Your portfolio is underperforming its benchmark index.</p>
          </div>

          {/* Overlap Warning */}
          <div className="glass-panel stagger-2" style={{ border: '1px solid var(--accent)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <AlertTriangle color="var(--accent)" /> High Overlap Detected
            </h3>
            <p style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>
              <strong>Parag Parikh Flexi Cap</strong> and <strong>HDFC Index Fund</strong> have a 62% stock overlap. You are paying active fees for index-like returns.
            </p>
            {mergeStep === 'idle' ? (
              <button className="btn btn-primary" style={{ background: 'var(--accent)', padding: '0.5rem 1rem', fontSize: '0.9rem' }} onClick={() => {
                setMergeStep('processing');
                setTimeout(() => setMergeStep('done'), 2000);
              }}>Merge Holdings</button>
            ) : mergeStep === 'processing' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', fontWeight: 'bold' }}>
                <Activity size={18} style={{ animation: 'pulse 1s infinite' }} /> Executing trades & minimizing tax impact...
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--secondary)', fontWeight: 'bold' }}>
                <CheckCircle size={18} /> Rebalanced! +₹1.2L projected lifetime return.
              </div>
            )}
          </div>

          {/* Expense Ratio Drag */}
          <div className="glass-panel stagger-3">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <PieChart className="text-gradient-primary" /> Expense Ratio Drag
            </h3>
            <p style={{ fontSize: '0.95rem' }}>
              You hold 3 <strong>Regular Plan</strong> mutual funds via agents.
            </p>
            <div style={{ background: 'var(--bg-light-elem)', padding: '1rem', marginTop: '1rem', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ color: 'var(--accent)', fontWeight: 'bold', fontSize: '1.5rem' }}>₹12.4 Lakhs</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Wealth lost to agent commissions over 20 years if not switched to Direct plans immediately.</div>
            </div>
          </div>

          {/* MentorAI Action Plan */}
          <div className="glass-panel stagger-4" style={{ gridColumn: '1 / -1' }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle color="var(--secondary)" /> MentorAI Restructuring Plan
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '1.5rem', alignItems: 'center', padding: '1rem', background: 'var(--bg-light-elem)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ background: 'rgba(244, 63, 94, 0.2)', color: 'var(--accent)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>SELL</div>
                <div>
                  <h4>SBI Bluechip Fund (Regular)</h4>
                  <p style={{ fontSize: '0.85rem' }}>Avoid 1.6% expense ratio. High overlap with Nifty 50.</p>
                </div>
                <strong>₹5,40,000</strong>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '1.5rem', alignItems: 'center', padding: '1rem', background: 'var(--bg-light-elem)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--secondary)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>BUY</div>
                <div>
                  <h4>UTI Nifty 50 Index Fund (Direct)</h4>
                  <p style={{ fontSize: '0.85rem' }}>0.2% expense ratio. Pure market returns.</p>
                </div>
                <strong>₹5,40,000</strong>
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '1rem', textAlign: 'center' }}>
              *MentorAI automatically calculated Short Term Capital Gains (STCG) impact. Proceeding is tax-optimized.
            </p>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
          <Search size={40} className="text-gradient-primary" />
          <span className="text-gradient">MF Portfolio X-Ray</span>
        </h1>
        <p style={{ marginTop: '1rem', fontSize: '1.2rem' }}>
          Upload your CAMS or KFintech CAS statement. Under 10 seconds, get absolute clarity.
        </p>
      </div>

      <div
        className="glass-panel stagger-1"
        style={{ border: '2px dashed var(--glass-border)', padding: '4rem 2rem', textAlign: 'center', cursor: 'pointer' }}
        onClick={handleUpload}
      >
        <UploadCloud size={64} color="var(--primary)" style={{ margin: '0 auto 1.5rem' }} />
        <h2>Click to Upload PDF</h2>
        <p style={{ marginTop: '0.5rem' }}>Supports CAMS / Kfintech Detailed CAS (PDF)</p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
          <span style={{ fontSize: '0.85rem', background: 'var(--bg-light-elem)', padding: '0.5rem 1rem', borderRadius: '50px' }}>🔐 Bank-grade encryption</span>
          <span style={{ fontSize: '0.85rem', background: 'var(--bg-light-elem)', padding: '0.5rem 1rem', borderRadius: '50px' }}>🛡️ Zero data retention</span>
        </div>
      </div>

      <style>{`
        @keyframes fillBar {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}
