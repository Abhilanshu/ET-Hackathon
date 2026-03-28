import { useState, useRef } from 'react';
import { FileText, Calculator, ArrowRight, Save, Coins, Cpu, Activity } from 'lucide-react';

export default function TaxWizard() {
  const [step, setStep] = useState<'upload' | 'scanning' | 'manual' | 'results'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setStep('scanning');
      setTimeout(() => {
        setFormData({
          grossSalary: 2200000,
          hraExemption: 180000,
          ltaExemption: 45000,
          sec80c: 150000,
          sec80d: 35000,
        });
        setStep('manual');
      }, 2500);
    }
  };

  const [formData, setFormData] = useState({
    grossSalary: 1500000,
    hraExemption: 150000,
    ltaExemption: 50000,
    sec80c: 150000,
    sec80d: 25000,
  });

  const calculateTax = () => {
    // Standard deduction
    const standardDeduction = 50000;

    // Old Regime
    const totalDeductionsOld = formData.hraExemption + formData.ltaExemption + formData.sec80c + formData.sec80d + standardDeduction;
    const taxableOld = Math.max(0, formData.grossSalary - totalDeductionsOld);

    // Simplistic Tax Brackets Old (approx)
    let taxOld = 0;
    if (taxableOld > 1000000) taxOld += (taxableOld - 1000000) * 0.3 + 112500;
    else if (taxableOld > 500000) taxOld += (taxableOld - 500000) * 0.2 + 12500;

    // New Regime
    // FY2023-24 rules: standard deduction is applicable, mostly other exemptions are gone
    const taxableNew = Math.max(0, formData.grossSalary - standardDeduction);
    let taxNew = 0;
    if (taxableNew > 1500000) taxNew += (taxableNew - 1500000) * 0.3 + 150000;
    else if (taxableNew > 1200000) taxNew += (taxableNew - 1200000) * 0.2 + 90000;
    else if (taxableNew > 900000) taxNew += (taxableNew - 900000) * 0.15 + 45000;
    else if (taxableNew > 600000) taxNew += (taxableNew - 600000) * 0.10 + 15000;
    else if (taxableNew > 300000) taxNew += (taxableNew - 300000) * 0.05;

    // Rebate 87A handling (simplified)
    if (taxableOld <= 500000) taxOld = 0;
    if (taxableNew <= 700000) taxNew = 0;

    // Cess 4%
    taxOld *= 1.04;
    taxNew *= 1.04;

    return { old: Math.round(taxOld), new: Math.round(taxNew) };
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  if (step === 'results') {
    const { old, new: taxNew } = calculateTax();
    const betterRegime = old < taxNew ? 'Old Regime' : 'New Regime';
    const savings = Math.abs(old - taxNew);

    return (
      <div className="animate-fade-in-up">
        <button onClick={() => setStep('upload')} className="btn btn-outline" style={{ marginBottom: '2rem' }}>
          &larr; Start Over
        </button>

        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1>MentorAI <span className="text-gradient">Tax Analysis</span></h1>
          <p style={{ marginTop: '0.5rem', fontSize: '1.1rem' }}>Based on your salary and investments, here is the optimal choice.</p>
        </div>

        <div className="glass-panel stagger-1" style={{ textAlign: 'center', marginBottom: '2rem', borderTop: '4px solid var(--primary)' }}>
          <h3 style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Winning Strategy</h3>
          <h2>You should choose the <span className="text-gradient-primary">{betterRegime}</span></h2>
          <p style={{ marginTop: '1rem', fontSize: '1.2rem', color: 'var(--secondary)' }}>
            <Save size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
            Saves you {formatCurrency(savings)} purely in taxes this year!
          </p>
        </div>

        <div className="dashboard-grid">
          <div className="glass-panel stagger-2" style={{ border: betterRegime === 'Old Regime' ? '1px solid var(--primary)' : '1px solid var(--glass-border)' }}>
            <h3 style={{ marginBottom: '1rem' }}>Old Tax Regime</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: '800' }}>{formatCurrency(old)}</div>
            <p style={{ color: 'var(--text-muted)' }}>Required Tax Payable</p>

            <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--bg-light-elem)', borderRadius: 'var(--radius-sm)' }}>
              <h4 style={{ marginBottom: '0.5rem' }}>Assumptions Made</h4>
              <ul style={{ paddingLeft: '1.5rem', opacity: 0.8, fontSize: '0.9rem', lineHeight: '1.5' }}>
                <li>Fully utilized ₹1.5L 80C limit</li>
                <li>Utilized HRA & LTA exemptions</li>
                <li>₹50,000 Standard Deduction included</li>
              </ul>
            </div>
          </div>

          <div className="glass-panel stagger-3" style={{ border: betterRegime === 'New Regime' ? '1px solid var(--primary)' : '1px solid var(--glass-border)' }}>
            <h3 style={{ marginBottom: '1rem' }}>New Tax Regime</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: '800' }}>{formatCurrency(taxNew)}</div>
            <p style={{ color: 'var(--text-muted)' }}>Required Tax Payable</p>

            <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--bg-light-elem)', borderRadius: 'var(--radius-sm)' }}>
              <h4 style={{ marginBottom: '0.5rem' }}>Assumptions Made</h4>
              <ul style={{ paddingLeft: '1.5rem', opacity: 0.8, fontSize: '0.9rem', lineHeight: '1.5' }}>
                <li>No investment proofs required</li>
                <li>Exemptions stripped away</li>
                <li>₹50,000 Standard Deduction included</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'scanning') {
    return (
      <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', textAlign: 'center' }}>
        <div style={{ position: 'relative' }}>
          <Cpu size={80} className="text-gradient-primary" style={{ animation: 'pulse 1.5s infinite' }} />
          <Activity size={32} color="var(--secondary)" style={{ position: 'absolute', bottom: -10, right: -10 }} />
        </div>
        <h2 style={{ marginTop: '2rem' }}>MentorAI is extracting your Form 16...</h2>
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Parsing salary components and TDS details.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
          <FileText size={40} className="text-gradient-primary" />
          <span className="text-gradient">Tax Wizard</span>
        </h1>
        <p style={{ marginTop: '1rem', fontSize: '1.2rem' }}>
          Upload Form 16 or manually input components to discover your perfect tax strategy.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div
          className="glass-panel stagger-1"
          style={{ textAlign: 'center', cursor: 'pointer', border: '1px dashed var(--primary)' }}
          onClick={() => fileInputRef.current?.click()}
        >
          <FileText size={48} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
          <h3>Upload Form 16</h3>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>MentorAI will extract it instantly</p>
          <input type="file" accept=".pdf" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />
        </div>

        <div className="glass-panel stagger-2" style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => setStep('manual')}>
          <Calculator size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3>Manual Input</h3>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Fill your salary components directly</p>
        </div>
      </div>

      {step === 'manual' && (
        <form
          className="glass-panel animate-fade-in-up"
          onSubmit={(e) => { e.preventDefault(); setStep('results'); }}
          style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
            <Coins color="var(--secondary)" /> Gross Salary & Standard Exemptions
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label>Annual Gross Salary</label>
              <input type="number" value={formData.grossSalary} onChange={(e) => setFormData({ ...formData, grossSalary: Number(e.target.value) })} required />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label>Declared HRA Exemption</label>
              <input type="number" value={formData.hraExemption} onChange={(e) => setFormData({ ...formData, hraExemption: Number(e.target.value) })} required />
            </div>
          </div>

          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginTop: '1.5rem' }}>
            <Save color="var(--primary)" /> Deductions (Chapter VI-A)
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label>80C (EPF, ELSS, Insurance)</label>
              <input type="number" value={formData.sec80c} onChange={(e) => setFormData({ ...formData, sec80c: Number(e.target.value) })} max={150000} required />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label>80D (Health Insurance)</label>
              <input type="number" value={formData.sec80d} onChange={(e) => setFormData({ ...formData, sec80d: Number(e.target.value) })} required />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '1.5rem', padding: '1.25rem' }}>
            Analyze Tax Regimes <ArrowRight size={20} />
          </button>
        </form>
      )
      }
    </div >
  );
}
