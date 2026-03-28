import { useState } from 'react';
import { Users, Layers, TrendingUp, Sparkles, CheckCircle } from 'lucide-react';

export default function CouplesPlanner() {
  const [step, setStep] = useState<'input' | 'results'>('input');
  
  const [partner1, setPartner1] = useState({ name: 'Rohit', income: 1800000, taxBracket: 30 });
  const [partner2, setPartner2] = useState({ name: 'Sneha', income: 800000, taxBracket: 15 });

  if (step === 'results') {
    return (
      <div className="animate-fade-in-up">
        <button onClick={() => setStep('input')} className="btn btn-outline" style={{ marginBottom: '2rem' }}>
          &larr; Recalculate
        </button>

        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
            <Users size={40} className="text-gradient-primary" />
            <span className="text-gradient">Joint Financial Playbook</span>
          </h1>
          <p style={{ marginTop: '1rem', fontSize: '1.2rem' }}>
            Optimized strategies across both incomes to maximize tax efficiency and compounding.
          </p>
        </div>

        <div className="dashboard-grid">
          {/* HRA & Rent */}
          <div className="glass-panel stagger-1">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Layers className="text-gradient-primary" /> HRA Optimization
            </h3>
            <p style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>
              Since {partner1.name} is in the {partner1.taxBracket}% bracket and {partner2.name} is in the {partner2.taxBracket}% bracket, 
              <strong> all rent receipts and the lease agreement should be in {partner1.name}'s name.</strong>
            </p>
            <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem', background: 'var(--bg-light-elem)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
              <CheckCircle size={18} color="var(--secondary)" style={{ marginTop: '0.1rem' }} />
              <div style={{ fontSize: '0.85rem' }}>Saves an additional ~₹45,000 in taxes annually compared to splitting the HRA claim.</div>
            </div>
          </div>

          {/* SIP & Investments Split */}
          <div className="glass-panel stagger-2">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <TrendingUp className="text-gradient-primary" /> SIP Routing
            </h3>
            <p style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>
              Routing new investments through {partner2.name}'s account is more tax-efficient for future Short-Term Capital Gains (STCG) and other taxable events.
            </p>
            <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem', background: 'var(--bg-light-elem)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
              <CheckCircle size={18} color="var(--secondary)" style={{ marginTop: '0.1rem' }} />
              <div style={{ fontSize: '0.85rem' }}>Prevents {partner1.name}'s income from ballooning further into the 30% bucket.</div>
            </div>
          </div>

          {/* Joint Insurance */}
          <div className="glass-panel stagger-3" style={{ gridColumn: '1 / -1', borderTop: '4px solid var(--primary)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Sparkles className="text-gradient-primary" /> MentorAI Insurance Plan
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
              <div>
                <h4 style={{ color: 'var(--text-muted)' }}>Health Insurance</h4>
                <p style={{ marginTop: '0.5rem' }}>Drop individual policies. Get a ₹10L Base Family Floater + ₹1Cr Super Top-up. <br/><strong>Premium payer:</strong> {partner1.name} (to claim 80D deduction at 30%).</p>
              </div>
              <div>
                <h4 style={{ color: 'var(--text-muted)' }}>Life Insurance</h4>
                <p style={{ marginTop: '0.5rem' }}>Take separate Term Plans. <br/>{partner1.name}: ₹2Cr Cover <br/>{partner2.name}: ₹1Cr Cover.</p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
          <Users size={40} className="text-gradient-primary" />
          <span className="text-gradient">Couple's Money Planner</span>
        </h1>
        <p style={{ marginTop: '1rem', fontSize: '1.2rem' }}>
          Stop optimizing separately. Input both profiles to unlock joint benefits.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Partner 1 */}
        <div className="glass-panel stagger-1">
          <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Partner 1</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label>Name</label>
              <input type="text" value={partner1.name} onChange={(e) => setPartner1({...partner1, name: e.target.value})} style={{ marginTop: '0.5rem' }}/>
            </div>
            <div>
              <label>Annual Income (₹)</label>
              <input type="number" value={partner1.income} onChange={(e) => setPartner1({...partner1, income: Number(e.target.value)})} style={{ marginTop: '0.5rem' }}/>
            </div>
            <div>
              <label>Effective Tax Bracket (%)</label>
              <select value={partner1.taxBracket} onChange={(e) => setPartner1({...partner1, taxBracket: Number(e.target.value)})} style={{ marginTop: '0.5rem' }}>
                <option value={0}>0%</option>
                <option value={5}>5%</option>
                <option value={10}>10%</option>
                <option value={15}>15%</option>
                <option value={20}>20%</option>
                <option value={30}>30%</option>
              </select>
            </div>
          </div>
        </div>

        {/* Partner 2 */}
        <div className="glass-panel stagger-2">
          <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Partner 2</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label>Name</label>
              <input type="text" value={partner2.name} onChange={(e) => setPartner2({...partner2, name: e.target.value})} style={{ marginTop: '0.5rem' }}/>
            </div>
            <div>
              <label>Annual Income (₹)</label>
              <input type="number" value={partner2.income} onChange={(e) => setPartner2({...partner2, income: Number(e.target.value)})} style={{ marginTop: '0.5rem' }}/>
            </div>
            <div>
              <label>Effective Tax Bracket (%)</label>
              <select value={partner2.taxBracket} onChange={(e) => setPartner2({...partner2, taxBracket: Number(e.target.value)})} style={{ marginTop: '0.5rem' }}>
                <option value={0}>0%</option>
                <option value={5}>5%</option>
                <option value={10}>10%</option>
                <option value={15}>15%</option>
                <option value={20}>20%</option>
                <option value={30}>30%</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <button onClick={() => setStep('results')} className="btn btn-primary stagger-3" style={{ width: '100%', marginTop: '2rem', padding: '1.25rem' }}>
        Generate Joint Strategy
      </button>
    </div>
  );
}
