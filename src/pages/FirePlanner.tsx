import { useState } from 'react';
import { LineChart, ArrowRight, ShieldCheck, Target, TrendingUp } from 'lucide-react';

export default function FirePlanner() {
  const [step, setStep] = useState<'input' | 'roadmap'>('input');
  const [formData, setFormData] = useState({
    age: 28,
    targetAge: 45,
    monthlyIncome: 120000,
    monthlyExpenses: 60000,
    currentCorpus: 500000
  });
  
  const [fireData, setFireData] = useState<any>(null);

  const calculateFIRE = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simplistic FIRE Engine calculation
    const yearsToRetire = formData.targetAge - formData.age;
    const requiredMonthlyPostRetirement = formData.monthlyExpenses * Math.pow(1.06, yearsToRetire); // 6% inflation
    const targetCorpus = requiredMonthlyPostRetirement * 12 * 25; // 4% rule
    
    // Basic SIP required at 12% return
    const rate = 0.12;
    const monthlyRate = rate / 12;
    const months = yearsToRetire * 12;
    
    // Future value of current corpus
    const fvCorpus = formData.currentCorpus * Math.pow(1 + rate, yearsToRetire);
    const requiredFromSip = Math.max(0, targetCorpus - fvCorpus);
    
    const requiredSip = (requiredFromSip * monthlyRate) / (Math.pow(1 + monthlyRate, months) - 1);
    
    setFireData({
      targetCorpus,
      requiredSip,
      fvCorpus,
      yearsToRetire
    });
    
    setStep('roadmap');
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  if (step === 'input') {
    return (
      <div className="animate-fade-in-up" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
            <LineChart size={40} className="text-gradient-primary" />
            <span className="text-gradient">FIRE Planner</span>
          </h1>
          <p style={{ marginTop: '1rem', fontSize: '1.2rem' }}>
            Financial Independence, Retire Early. Let MentorAI map your escape velocity.
          </p>
        </div>

        <form onSubmit={calculateFIRE} className="glass-panel stagger-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label>Current Age</label>
            <input 
              type="number" 
              value={formData.age} 
              onChange={e => setFormData({...formData, age: Number(e.target.value)})}
              required min={18} max={80}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label>Target Retirement Age</label>
            <input 
              type="number" 
              value={formData.targetAge} 
              onChange={e => setFormData({...formData, targetAge: Number(e.target.value)})}
              required min={formData.age + 1} max={80}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label>Monthly Income (Take-home)</label>
            <input 
              type="number" 
              value={formData.monthlyIncome} 
              onChange={e => setFormData({...formData, monthlyIncome: Number(e.target.value)})}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label>Monthly Expenses</label>
            <input 
              type="number" 
              value={formData.monthlyExpenses} 
              onChange={e => setFormData({...formData, monthlyExpenses: Number(e.target.value)})}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', gridColumn: '1 / -1' }}>
            <label>Current Investments (Mutual Funds, Stocks, PF)</label>
            <input 
              type="number" 
              value={formData.currentCorpus} 
              onChange={e => setFormData({...formData, currentCorpus: Number(e.target.value)})}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ gridColumn: '1 / -1', marginTop: '1rem', padding: '1.25rem' }}>
            Generate MentorAI Roadmap <ArrowRight size={20} />
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Your <span className="text-gradient">FIRE Roadmap</span></h1>
          <p style={{ marginTop: '0.5rem', fontSize: '1.1rem' }}>Retiring in {fireData.yearsToRetire} years requires discipline. Here is the math.</p>
        </div>
        <button className="btn btn-outline" onClick={() => setStep('input')}>Edit Variables</button>
      </div>

      <div className="dashboard-grid">
        <div className="glass-panel stagger-1" style={{ borderTop: '4px solid var(--primary)' }}>
          <h3 style={{ color: 'var(--text-muted)' }}>Target FIRE Corpus</h3>
          <h2 style={{ fontSize: '2.5rem', marginTop: '1rem' }}>{formatCurrency(fireData.targetCorpus)}</h2>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Adjusted for 6% inflation</p>
        </div>

        <div className="glass-panel stagger-2" style={{ borderTop: '4px solid var(--secondary)' }}>
          <h3 style={{ color: 'var(--text-muted)' }}>Required Monthly SIP</h3>
          <h2 style={{ fontSize: '2.5rem', marginTop: '1rem', color: 'var(--secondary)' }}>{formatCurrency(fireData.requiredSip)}</h2>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Assuming 12% annualized return</p>
        </div>

        <div className="glass-panel stagger-3" style={{ gridColumn: '1 / -1' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Target size={20} className="text-gradient-primary" />
            MentorAI Strategy
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1rem', background: 'var(--bg-light-elem)', borderRadius: 'var(--radius-sm)' }}>
              <TrendingUp color="var(--primary)" size={24} style={{ marginTop: '0.25rem' }} />
              <div>
                <h4 style={{ marginBottom: '0.25rem' }}>Asset Allocation Shift</h4>
                <p style={{ fontSize: '0.95rem' }}>For the next {Math.max(1, fireData.yearsToRetire - 5)} years, maintain an aggressive 80/20 Equity-to-Debt portfolio structure. We recommend Nifty50 Index Funds paired with Liquid Funds.</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1rem', background: 'var(--bg-light-elem)', borderRadius: 'var(--radius-sm)' }}>
              <ShieldCheck color="var(--secondary)" size={24} style={{ marginTop: '0.25rem' }} />
              <div>
                <h4 style={{ marginBottom: '0.25rem' }}>Guardrails Setup</h4>
                <p style={{ fontSize: '0.95rem' }}>FIRE requires bulletproof health insurance. An unforeseen medical event can derail your corpus by 30%. Increase base cover to ₹25L with a ₹1Cr Super Top-up.</p>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
