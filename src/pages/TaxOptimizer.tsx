import { useState, useMemo } from 'react';
import { PiggyBank, CheckCircle2, AlertCircle, TrendingUp, Briefcase, Plus, Trash2, ChevronRight } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface TaxInputs {
  grossSalary: number;
  otherIncome: number;
  hraExemption: number;
  ltaExemption: number;
  sec80c: number;
  sec80ccd1b: number; // NPS extra
  sec80d: number;
  sec80e: number;
  sec80g: number;
  homeLoanInterest: number;
  businessIncome: number;
}

interface BusinessExpense {
  id: string;
  category: string;
  amount: number;
}

// ─── Deduction catalogue (Indian FY2024-25) ───────────────────────────────────
const DEDUCTIONS = [
  { key: 'sec80c', label: '80C — EPF / ELSS / PPF / LIC', max: 150000, tip: 'Invest in ELSS for lowest lock-in (3 yrs) + best returns among tax savers.' },
  { key: 'sec80ccd1b', label: '80CCD(1B) — NPS (Additional)', max: 50000, tip: 'NPS contributions above 80C limit get extra ₹50k deduction. Ideal for salaried.' },
  { key: 'sec80d', label: '80D — Health Insurance', max: 75000, tip: 'Self+family: ₹25k; Senior citizen parents: extra ₹50k. Buy comprehensive floater.' },
  { key: 'sec80e', label: '80E — Education Loan Interest', max: Infinity, tip: 'No upper limit. Full interest deductible for 8 years from loan start.' },
  { key: 'sec80g', label: '80G — Donations (Approved NGOs)', max: Infinity, tip: 'Donations to PM Relief Fund get 100% deduction. Others: 50% with limits.' },
  { key: 'homeLoanInterest', label: '24(b) — Home Loan Interest', max: 200000, tip: 'Up to ₹2L interest deduction on self-occupied property. Unlimited for let-out.' },
];

const EXPENSE_CATEGORIES = ['Software & Tools', 'Travel & Fuel', 'Internet & Phone', 'Office Supplies', 'Professional Services', 'Marketing', 'Depreciation (Assets)', 'Other'];

const FMT = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

// ─── Tax calculation engine ───────────────────────────────────────────────────
function computeTax(inputs: TaxInputs, businessExpenses: BusinessExpense[]) {
  const STANDARD_DEDUCTION = 50000;
  const totalBizExpenses = businessExpenses.reduce((s, e) => s + e.amount, 0);
  const grossIncome = inputs.grossSalary + inputs.otherIncome + Math.max(0, inputs.businessIncome - totalBizExpenses);

  // Old regime
  const totalOldDeductions = STANDARD_DEDUCTION + inputs.hraExemption + inputs.ltaExemption +
    Math.min(inputs.sec80c, 150000) + Math.min(inputs.sec80ccd1b, 50000) +
    Math.min(inputs.sec80d, 75000) + inputs.sec80e + inputs.sec80g +
    Math.min(inputs.homeLoanInterest, 200000);

  const taxableOld = Math.max(0, grossIncome - totalOldDeductions);
  let taxOld = 0;
  if (taxableOld > 1500000) taxOld = 112500 + 187500 + (taxableOld - 1500000) * 0.30;
  else if (taxableOld > 1000000) taxOld = 112500 + (taxableOld - 1000000) * 0.25;
  else if (taxableOld > 500000) taxOld = 12500 + (taxableOld - 500000) * 0.20;
  else if (taxableOld > 250000) taxOld = (taxableOld - 250000) * 0.05;
  if (taxableOld <= 500000) taxOld = 0; // Rebate 87A
  taxOld *= 1.04; // 4% cess

  // New regime (FY25 — enhanced slabs)
  const taxableNew = Math.max(0, grossIncome - STANDARD_DEDUCTION);
  let taxNew = 0;
  if (taxableNew > 1500000) taxNew = 150000 + (taxableNew - 1500000) * 0.30;
  else if (taxableNew > 1200000) taxNew = 90000 + (taxableNew - 1200000) * 0.20;
  else if (taxableNew > 900000) taxNew = 45000 + (taxableNew - 900000) * 0.15;
  else if (taxableNew > 600000) taxNew = 15000 + (taxableNew - 600000) * 0.10;
  else if (taxableNew > 300000) taxNew = (taxableNew - 300000) * 0.05;
  if (taxableNew <= 700000) taxNew = 0; // Rebate 87A new
  taxNew *= 1.04;

  return {
    grossIncome,
    taxableOld: Math.round(taxableOld),
    taxableNew: Math.round(taxableNew),
    taxOld: Math.round(taxOld),
    taxNew: Math.round(taxNew),
    totalOldDeductions: Math.round(totalOldDeductions),
    totalBizExpenses: Math.round(totalBizExpenses),
    betterRegime: taxOld <= taxNew ? 'old' : 'new',
    savings: Math.abs(taxOld - taxNew),
  };
}

// ─── Deduction suggestions ────────────────────────────────────────────────────
function getSuggestions(inputs: TaxInputs, taxResult: ReturnType<typeof computeTax>) {
  const suggestions: { section: string; gap: number; taxSaved: number; message: string }[] = [];
  const marginalRate = taxResult.taxableOld > 1000000 ? 0.30 : taxResult.taxableOld > 500000 ? 0.20 : 0.05;

  DEDUCTIONS.filter(d => d.max !== Infinity).forEach(d => {
    const used = inputs[d.key as keyof TaxInputs] as number;
    const gap = d.max - Math.min(used, d.max);
    if (gap > 0 && gap >= 5000) {
      const saved = Math.round(gap * marginalRate * 1.04);
      suggestions.push({
        section: d.label,
        gap,
        taxSaved: saved,
        message: `Invest ${FMT(gap)} more to save ${FMT(saved)} in taxes`,
      });
    }
  });

  return suggestions.sort((a, b) => b.taxSaved - a.taxSaved);
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function TaxOptimizer() {
  const [tab, setTab] = useState<'projection' | 'optimizer' | 'business'>('projection');
  const [inputs, setInputs] = useState<TaxInputs>({
    grossSalary: 1500000, otherIncome: 0, hraExemption: 120000, ltaExemption: 30000,
    sec80c: 80000, sec80ccd1b: 0, sec80d: 15000, sec80e: 0, sec80g: 0,
    homeLoanInterest: 0, businessIncome: 0,
  });
  const [bizExpenses, setBizExpenses] = useState<BusinessExpense[]>([]);
  const [newExp, setNewExp] = useState({ category: EXPENSE_CATEGORIES[0], amount: 0 });

  const set = (key: keyof TaxInputs, val: number) => setInputs(p => ({ ...p, [key]: val }));
  const result = useMemo(() => computeTax(inputs, bizExpenses), [inputs, bizExpenses]);
  const suggestions = useMemo(() => getSuggestions(inputs, result), [inputs, result]);

  const addExpense = () => {
    if (newExp.amount <= 0) return;
    setBizExpenses(prev => [...prev, { ...newExp, id: Date.now().toString() }]);
    setNewExp({ category: EXPENSE_CATEGORIES[0], amount: 0 });
  };

  const TABS = [
    { id: 'projection', label: 'Tax Projection', icon: TrendingUp },
    { id: 'optimizer', label: 'Deduction Optimizer', icon: PiggyBank },
    { id: 'business', label: 'Business Expenses', icon: Briefcase },
  ] as const;

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <PiggyBank size={40} color="var(--primary)" />
          <span>Tax <span className="text-gradient">Optimizer</span></span>
        </h1>
        <p style={{ marginTop: '0.5rem', fontSize: '1.1rem' }}>
          Real-time tax liability projection + proactive deduction suggestions for Indian taxpayers.
        </p>
      </div>

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', background: 'var(--bg-light-elem)', padding: '0.4rem', borderRadius: 'var(--radius-md)', width: 'fit-content', border: '1px solid var(--glass-border)' }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', fontFamily: 'inherit', transition: 'all 0.2s',
              background: tab === id ? 'var(--primary)' : 'transparent',
              color: tab === id ? 'white' : 'var(--text-muted)' }}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {/* ── Tab: Tax Projection ── */}
      {tab === 'projection' && (
        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '2rem', alignItems: 'start' }}>
          {/* Inputs */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Income & Exemptions</h3>
            {[
              { label: 'Annual Gross Salary (₹)', key: 'grossSalary' as const },
              { label: 'Other Income — Interest, Rent (₹)', key: 'otherIncome' as const },
              { label: 'HRA Exemption (₹)', key: 'hraExemption' as const },
              { label: 'LTA Exemption (₹)', key: 'ltaExemption' as const },
              { label: '80C — ELSS / EPF / PPF (₹, max ₹1.5L)', key: 'sec80c' as const, max: 150000 },
              { label: '80CCD(1B) — NPS Extra (₹, max ₹50k)', key: 'sec80ccd1b' as const, max: 50000 },
              { label: '80D — Health Insurance (₹)', key: 'sec80d' as const },
              { label: 'Home Loan Interest 24(b) (₹)', key: 'homeLoanInterest' as const },
            ].map(({ label, key, max }) => (
              <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{label}</label>
                <input type="number" value={inputs[key]} max={max}
                  onChange={e => set(key, Math.min(Number(e.target.value), max ?? Infinity))}
                  style={{ padding: '0.65rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', background: 'var(--bg-light-elem)', color: 'var(--text-main)', fontSize: '0.95rem' }} />
              </div>
            ))}
          </div>

          {/* Results */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Winner Banner */}
            <div className="glass-panel" style={{ textAlign: 'center', borderTop: `4px solid ${result.betterRegime === 'old' ? 'var(--primary)' : 'var(--secondary)'}`, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-30px', right: '-30px', opacity: 0.05 }}>
                <PiggyBank size={150} />
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Optimal Strategy</p>
              <h2 style={{ fontSize: '1.8rem' }}>
                <span className="text-gradient-primary">{result.betterRegime === 'old' ? 'Old Regime' : 'New Regime'}</span> saves you
              </h2>
              <p style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--secondary)', marginTop: '0.5rem' }}>{FMT(result.savings)}</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>in taxes this financial year</p>
            </div>

            {/* Side-by-side regime cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {[
                { regime: 'old', label: 'Old Regime', tax: result.taxOld, taxable: result.taxableOld, deductions: result.totalOldDeductions },
                { regime: 'new', label: 'New Regime', tax: result.taxNew, taxable: result.taxableNew, deductions: 50000 },
              ].map(r => (
                <div key={r.regime} className="glass-panel" style={{ border: `2px solid ${result.betterRegime === r.regime ? 'var(--primary)' : 'var(--glass-border)'}`, position: 'relative' }}>
                  {result.betterRegime === r.regime && (
                    <div style={{ position: 'absolute', top: '-1px', right: '1.5rem', background: 'var(--primary)', color: 'white', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.75rem', borderRadius: '0 0 8px 8px' }}>
                      RECOMMENDED ✓
                    </div>
                  )}
                  <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem' }}>{r.label}</h3>
                  {[
                    { label: 'Gross Income', val: FMT(result.grossIncome), color: 'var(--text-main)' },
                    { label: 'Total Deductions', val: FMT(r.deductions), color: 'var(--secondary)' },
                    { label: 'Taxable Income', val: FMT(r.taxable), color: 'var(--text-muted)' },
                    { label: 'Final Tax + Cess', val: FMT(r.tax), color: 'var(--accent)' },
                    { label: 'Effective Rate', val: `${result.grossIncome > 0 ? ((r.tax / result.grossIncome) * 100).toFixed(1) : 0}%`, color: 'var(--primary)' },
                  ].map(({ label, val, color }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid var(--glass-border)', fontSize: '0.9rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                      <span style={{ fontWeight: 700, color }}>{val}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Deduction Optimizer ── */}
      {tab === 'optimizer' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
          {/* Deduction Checklist */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Available Deductions</h3>
            {DEDUCTIONS.map(d => {
              const used = Math.min((inputs[d.key as keyof TaxInputs] as number) || 0, d.max === Infinity ? Infinity : d.max);
              const limit = d.max === Infinity ? null : d.max;
              const pct = limit ? Math.min((used / limit) * 100, 100) : 100;
              const gap = limit ? limit - used : 0;
              const marginalRate = result.taxableOld > 1000000 ? 0.30 : result.taxableOld > 500000 ? 0.20 : 0.05;
              const potentialSaving = Math.round(gap * marginalRate * 1.04);

              return (
                <div key={d.key} className="glass-panel" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'flex-start', gap: '1rem' }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '0.2rem' }}>{d.label}</p>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{d.tip}</p>
                    </div>
                    {gap > 0 && potentialSaving > 0 && (
                      <span style={{ fontSize: '0.75rem', background: 'rgba(16,185,129,0.15)', color: 'var(--secondary)', padding: '0.2rem 0.5rem', borderRadius: '99px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                        Save {FMT(potentialSaving)}
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    value={(inputs[d.key as keyof TaxInputs] as number) || 0}
                    max={limit ?? undefined}
                    onChange={e => setInputs(p => ({ ...p, [d.key]: Math.min(Number(e.target.value), limit ?? Infinity) }))}
                    style={{ padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', background: 'var(--bg-light-elem)', color: 'var(--text-main)', fontSize: '0.9rem', marginBottom: '0.6rem' }}
                  />
                  {limit && (
                    <>
                      <div style={{ height: '6px', background: 'var(--bg-light-elem)', borderRadius: '99px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: pct >= 100 ? 'var(--secondary)' : 'var(--primary)', borderRadius: '99px', transition: 'width 0.4s ease' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                        <span>{FMT(used)} used</span>
                        <span>Limit: {FMT(limit)}</span>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Suggestions Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: '6rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>💡 AI Suggestions</h3>
            {suggestions.length === 0 ? (
              <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
                <CheckCircle2 size={48} color="var(--secondary)" style={{ margin: '0 auto 1rem' }} />
                <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>Deductions Fully Optimized!</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>You've maximized all available deduction limits.</p>
              </div>
            ) : (
              suggestions.map((s, i) => (
                <div key={i} className="glass-panel" style={{ padding: '1.25rem', border: '1px solid rgba(249,115,22,0.2)', background: 'rgba(249,115,22,0.04)' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)' }}>{i + 1}</span>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{s.section}</p>
                      <p style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.4 }}>{s.message}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <ChevronRight size={14} color="var(--primary)" />
                        <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>Gap: {FMT(s.gap)} remaining</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Total potential saving */}
            {suggestions.length > 0 && (
              <div className="glass-panel" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', textAlign: 'center', padding: '1.5rem' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Tax You Can Still Save</p>
                <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--secondary)' }}>{FMT(suggestions.reduce((s, x) => s + x.taxSaved, 0))}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>by fully utilizing all sections</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Tab: Business Expenses ── */}
      {tab === 'business' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-panel">
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Business Income</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Enter your gross business / freelance income before deducting expenses.</p>
              <input type="number" value={inputs.businessIncome}
                onChange={e => set('businessIncome', Number(e.target.value))}
                style={{ padding: '0.65rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', background: 'var(--bg-light-elem)', color: 'var(--text-main)', fontSize: '1rem' }} />
            </div>

            <div className="glass-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem' }}>Claimable Expenses</h3>
              </div>

              {/* Add expense */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px auto', gap: '0.75rem', marginBottom: '1.25rem', alignItems: 'end' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Category</label>
                  <select value={newExp.category} onChange={e => setNewExp(p => ({ ...p, category: e.target.value }))}
                    style={{ padding: '0.65rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', background: 'var(--bg-light-elem)', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                    {EXPENSE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Amount (₹)</label>
                  <input type="number" value={newExp.amount || ''}
                    onChange={e => setNewExp(p => ({ ...p, amount: Number(e.target.value) }))}
                    style={{ padding: '0.65rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', background: 'var(--bg-light-elem)', color: 'var(--text-main)', fontSize: '0.9rem' }} />
                </div>
                <button onClick={addExpense} className="btn btn-primary" style={{ padding: '0.65rem 1rem', borderRadius: 'var(--radius-sm)' }}>
                  <Plus size={16} />
                </button>
              </div>

              {/* Expense list */}
              {bizExpenses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  <AlertCircle size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                  Add claimable business expenses to reduce your taxable income.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {bizExpenses.map(e => (
                    <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'var(--bg-light-elem)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)' }}>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{e.category}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontWeight: 700, color: 'var(--secondary)', fontSize: '0.9rem' }}>-{FMT(e.amount)}</span>
                        <button onClick={() => setBizExpenses(prev => prev.filter(x => x.id !== e.id))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Business tax summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'sticky', top: '6rem' }}>
            <div className="glass-panel">
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Business Tax Summary</h3>
              {[
                { label: 'Gross Business Income', val: FMT(inputs.businessIncome), color: 'var(--text-main)' },
                { label: 'Total Claimable Expenses', val: FMT(result.totalBizExpenses), color: 'var(--secondary)' },
                { label: 'Net Taxable Business Income', val: FMT(Math.max(0, inputs.businessIncome - result.totalBizExpenses)), color: 'var(--primary)' },
              ].map(({ label, val, color }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid var(--glass-border)', fontSize: '0.95rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                  <span style={{ fontWeight: 700, color }}>{val}</span>
                </div>
              ))}

              <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(16,185,129,0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16,185,129,0.2)', textAlign: 'center' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Tax Saved via Business Expenses</p>
                <p style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--secondary)' }}>
                  {FMT(Math.round(result.totalBizExpenses * (result.taxableOld > 1000000 ? 0.30 : 0.20) * 1.04))}
                </p>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.25rem', background: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.2)' }}>
              <h4 style={{ marginBottom: '0.75rem', fontSize: '0.95rem' }}>💡 Pro Tips for Freelancers</h4>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 2 }}>
                <li>Keep GST invoices for all software subscriptions</li>
                <li>Log business travel with purpose & dates</li>
                <li>Phone/internet: only business-use % is claimable</li>
                <li>Laptop / camera depreciation: 40% WDV method</li>
                <li>Co-working space rent is 100% deductible</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
