import { useState, useMemo } from 'react';
import { CreditCard, Plus, Trash2, TrendingDown, Zap, Trophy, BarChart3, ChevronDown, ChevronUp } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Debt {
  id: string;
  name: string;
  type: 'credit_card' | 'personal_loan' | 'home_loan' | 'vehicle_loan' | 'education_loan';
  balance: number;
  interestRate: number;
  minimumPayment: number;
}

const DEBT_TYPE_LABELS: Record<Debt['type'], string> = {
  credit_card: 'Credit Card',
  personal_loan: 'Personal Loan',
  home_loan: 'Home Loan / Mortgage',
  vehicle_loan: 'Vehicle Loan',
  education_loan: 'Education Loan',
};

const FMT = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

// ─── Inline simulation (mirrors debtOptimizer.js) ────────────────────────────
function simulate(sortedDebts: Debt[], extraPayment: number) {
  let debts = sortedDebts.map(d => ({ ...d }));
  let totalInterest = 0;
  let month = 0;
  const balanceByMonth: number[] = [];
  const MAX = 600;

  while (debts.some(d => d.balance > 0) && month < MAX) {
    month++;
    let remainingExtra = extraPayment;
    const priorityDebt = debts.find(d => d.balance > 0);

    for (const debt of debts) {
      if (debt.balance <= 0) continue;
      const interest = debt.balance * (debt.interestRate / 100 / 12);
      totalInterest += interest;
      debt.balance += interest;
      const payment = Math.min(debt.minimumPayment, debt.balance);
      debt.balance -= payment;
      if (remainingExtra > 0 && debt === priorityDebt) {
        const extra = Math.min(remainingExtra, debt.balance);
        debt.balance -= extra;
        remainingExtra -= extra;
      }
      debt.balance = Math.max(0, debt.balance);
    }
    balanceByMonth.push(Math.round(debts.reduce((s, d) => s + d.balance, 0)));
  }

  return { months: month, totalInterestPaid: Math.round(totalInterest), balanceByMonth };
}

function runAvalanche(debts: Debt[], extra: number) {
  return simulate([...debts].sort((a, b) => b.interestRate - a.interestRate), extra);
}

function runSnowball(debts: Debt[], extra: number) {
  return simulate([...debts].sort((a, b) => a.balance - b.balance), extra);
}

function runMinimum(debts: Debt[]) {
  return simulate([...debts], 0);
}

// ─── Timeline chart ───────────────────────────────────────────────────────────
function TimelineChart({ avalanche, snowball, minimum }: { avalanche: number[], snowball: number[], minimum: number[] }) {
  const maxMonths = Math.min(Math.max(avalanche.length, snowball.length, minimum.length), 120);
  const maxBal = minimum[0] ?? 1;
  const W = 600, H = 200, PAD = 40;
  const xScale = (i: number) => PAD + ((i / Math.max(maxMonths - 1, 1)) * (W - PAD * 2));
  const yScale = (v: number) => PAD + ((1 - v / maxBal) * (H - PAD * 2));

  const pathFor = (data: number[]) => {
    const pts = data.slice(0, maxMonths);
    return pts.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)},${yScale(v)}`).join(' ');
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map(pct => (
        <g key={pct}>
          <line x1={PAD} y1={yScale(maxBal * pct)} x2={W - PAD} y2={yScale(maxBal * pct)} stroke="rgba(0,0,0,0.06)" strokeWidth="1" />
          <text x={PAD - 6} y={yScale(maxBal * pct) + 4} fontSize="9" fill="var(--text-muted)" textAnchor="end">
            ₹{((maxBal * pct) / 100000).toFixed(0)}L
          </text>
        </g>
      ))}
      {/* Minimum (gray) */}
      <path d={pathFor(minimum)} stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="6,4" fill="none" />
      {/* Snowball (amber) */}
      <path d={pathFor(snowball)} stroke="#f59e0b" strokeWidth="2" fill="none" />
      {/* Avalanche (green) */}
      <path d={pathFor(avalanche)} stroke="var(--secondary)" strokeWidth="2.5" fill="none" />
      {/* Axis */}
      <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="var(--glass-border)" strokeWidth="1" />
      <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="var(--glass-border)" strokeWidth="1" />
      {/* X labels */}
      {[0, Math.round(maxMonths / 2), maxMonths - 1].map(i => (
        <text key={i} x={xScale(i)} y={H - PAD + 16} fontSize="9" fill="var(--text-muted)" textAnchor="middle">
          {i}mo
        </text>
      ))}
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function DebtManager() {
  const [debts, setDebts] = useState<Debt[]>([
    { id: '1', name: 'HDFC Credit Card', type: 'credit_card', balance: 80000, interestRate: 36, minimumPayment: 3000 },
    { id: '2', name: 'SBI Personal Loan', type: 'personal_loan', balance: 350000, interestRate: 14, minimumPayment: 8500 },
  ]);
  const [extraPayment, setExtraPayment] = useState(5000);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showChart, setShowChart] = useState(true);
  const [newDebt, setNewDebt] = useState<Omit<Debt, 'id'>>({
    name: '', type: 'personal_loan', balance: 0, interestRate: 0, minimumPayment: 0,
  });

  const totalDebt = debts.reduce((s, d) => s + d.balance, 0);
  const totalMinPayment = debts.reduce((s, d) => s + d.minimumPayment, 0);

  const avalanche = useMemo(() => runAvalanche(debts, extraPayment), [debts, extraPayment]);
  const snowball = useMemo(() => runSnowball(debts, extraPayment), [debts, extraPayment]);
  const minimum = useMemo(() => runMinimum(debts), [debts]);
  const winner = avalanche.totalInterestPaid <= snowball.totalInterestPaid ? 'avalanche' : 'snowball';
  const best = winner === 'avalanche' ? avalanche : snowball;
  const interestSaved = minimum.totalInterestPaid - best.totalInterestPaid;
  const monthsSaved = minimum.months - best.months;

  const addDebt = () => {
    if (!newDebt.name || newDebt.balance <= 0 || newDebt.interestRate <= 0) return;
    setDebts(prev => [...prev, { ...newDebt, id: Date.now().toString() }]);
    setNewDebt({ name: '', type: 'personal_loan', balance: 0, interestRate: 0, minimumPayment: 0 });
    setShowAddForm(false);
  };

  const STRATEGY_CARDS = [
    {
      key: 'avalanche',
      label: 'Debt Avalanche',
      icon: Zap,
      color: 'var(--secondary)',
      bg: 'rgba(16,185,129,0.06)',
      border: 'rgba(16,185,129,0.25)',
      result: avalanche,
      order: [...debts].sort((a, b) => b.interestRate - a.interestRate).map(d => d.name),
      desc: 'Highest interest rate first. Mathematically optimal — saves the most money.',
      tag: 'Best for: Saving Maximum Money',
    },
    {
      key: 'snowball',
      label: 'Debt Snowball',
      icon: TrendingDown,
      color: '#f59e0b',
      bg: 'rgba(245,158,11,0.06)',
      border: 'rgba(245,158,11,0.25)',
      result: snowball,
      order: [...debts].sort((a, b) => a.balance - b.balance).map(d => d.name),
      desc: 'Smallest balance first. Builds momentum through quick psychological wins.',
      tag: 'Best for: Staying Motivated',
    },
  ];

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <CreditCard size={40} color="var(--primary)" />
          <span>Debt <span className="text-gradient">Manager</span></span>
        </h1>
        <p style={{ marginTop: '0.5rem', fontSize: '1.1rem' }}>
          Find your fastest path to debt freedom using Avalanche & Snowball strategies.
        </p>
      </div>

      {/* Summary KPIs */}
      {debts.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Total Debt', value: FMT(totalDebt), color: 'var(--accent)' },
            { label: 'Min Monthly Payment', value: FMT(totalMinPayment), color: 'var(--text-muted)' },
            { label: 'Months Saved (vs Min)', value: monthsSaved > 0 ? `${monthsSaved} months` : '—', color: 'var(--secondary)' },
            { label: 'Interest Saved (vs Min)', value: interestSaved > 0 ? FMT(interestSaved) : '—', color: 'var(--secondary)' },
          ].map(({ label, value, color }) => (
            <div key={label} className="glass-panel stagger-1" style={{ padding: '1.25rem', textAlign: 'center' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{label}</p>
              <p style={{ fontSize: '1.4rem', fontWeight: 800, color }}>{value}</p>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '2rem', alignItems: 'start' }}>

        {/* ── Left: Debt Registry ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          <div className="glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem' }}>Your Debts ({debts.length})</h3>
              <button onClick={() => setShowAddForm(v => !v)} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
                <Plus size={14} /> Add Debt
              </button>
            </div>

            {/* Add form */}
            {showAddForm && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1.25rem', background: 'var(--bg-light-elem)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', border: '1px solid var(--glass-border)' }}>
                <input placeholder="Debt Name (e.g. HDFC Credit Card)" value={newDebt.name} onChange={e => setNewDebt(p => ({ ...p, name: e.target.value }))} style={{ padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', background: 'var(--bg-light)', color: 'var(--text-main)', fontSize: '0.9rem' }} />
                <select value={newDebt.type} onChange={e => setNewDebt(p => ({ ...p, type: e.target.value as Debt['type'] }))} style={{ padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', background: 'var(--bg-light)', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                  {Object.entries(DEBT_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                {[
                  { label: 'Outstanding Balance (₹)', key: 'balance' as const },
                  { label: 'Annual Interest Rate (%)', key: 'interestRate' as const },
                  { label: 'Minimum Monthly Payment (₹)', key: 'minimumPayment' as const },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>{label}</label>
                    <input type="number" value={newDebt[key] || ''} onChange={e => setNewDebt(p => ({ ...p, [key]: Number(e.target.value) }))} style={{ padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', background: 'var(--bg-light)', color: 'var(--text-main)', fontSize: '0.9rem' }} />
                  </div>
                ))}
                <button onClick={addDebt} className="btn btn-primary" style={{ padding: '0.65rem', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}>
                  Add to Registry
                </button>
              </div>
            )}

            {/* Debt list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {debts.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem', fontSize: '0.9rem' }}>No debts added yet. Add your first debt above.</p>}
              {debts.map(d => {
                const monthlyInterest = (d.balance * (d.interestRate / 100)) / 12;
                const principalPayment = d.minimumPayment - monthlyInterest;
                return (
                  <div key={d.id} style={{ padding: '1rem', background: 'var(--bg-light-elem)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>{d.name}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{DEBT_TYPE_LABELS[d.type]} · {d.interestRate}% p.a.</p>
                      </div>
                      <button onClick={() => setDebts(prev => prev.filter(x => x.id !== d.id))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                      {[
                        { label: 'Balance', val: FMT(d.balance), color: 'var(--accent)' },
                        { label: 'Min EMI', val: FMT(d.minimumPayment), color: 'var(--text-muted)' },
                        { label: 'Monthly Interest', val: FMT(Math.round(monthlyInterest)), color: '#f59e0b' },
                      ].map(({ label, val, color }) => (
                        <div key={label} style={{ textAlign: 'center', padding: '0.5rem', background: 'var(--bg-light)', borderRadius: 'var(--radius-sm)' }}>
                          <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>{label}</p>
                          <p style={{ fontSize: '0.82rem', fontWeight: 700, color }}>{val}</p>
                        </div>
                      ))}
                    </div>
                    {principalPayment < 0 && (
                      <div style={{ marginTop: '0.6rem', padding: '0.4rem 0.6rem', background: 'rgba(244,63,94,0.1)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: 'var(--accent)' }}>
                        ⚠️ Min payment doesn't cover interest — balance growing every month!
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Extra payment slider */}
          {debts.length > 0 && (
            <div className="glass-panel">
              <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Extra Monthly Payment</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Beyond your minimum payments — this is where you accelerate.</p>
              <input type="range" min={0} max={50000} step={500} value={extraPayment}
                onChange={e => setExtraPayment(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>₹0</span>
                <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.1rem' }}>{FMT(extraPayment)}/mo</span>
                <span>₹50,000</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Strategy Comparison ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {debts.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem' }}>
              <CreditCard size={64} style={{ margin: '0 auto 1.5rem', opacity: 0.2 }} />
              <h3 style={{ marginBottom: '0.75rem' }}>Add your debts to get started</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Once you add at least one debt, the optimizer will show you the fastest path to debt freedom.</p>
            </div>
          ) : (
            <>
              {/* Winner banner */}
              <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem 2rem', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <Trophy size={40} color="var(--secondary)" style={{ flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>MentorAI Recommends</p>
                  <h3 style={{ color: 'var(--secondary)', fontSize: '1.2rem' }}>{winner === 'avalanche' ? 'Debt Avalanche' : 'Debt Snowball'} Strategy</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Saves {FMT(interestSaved)} in interest & {monthsSaved} months vs. minimum payments only
                  </p>
                </div>
              </div>

              {/* Strategy cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {STRATEGY_CARDS.map(s => {
                  const Icon = s.icon;
                  const isWinner = winner === s.key;
                  return (
                    <div key={s.key} className="glass-panel" style={{ border: `2px solid ${isWinner ? s.color : 'var(--glass-border)'}`, background: isWinner ? s.bg : undefined, position: 'relative' }}>
                      {isWinner && (
                        <div style={{ position: 'absolute', top: '-1px', right: '1.5rem', background: s.color, color: 'white', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.75rem', borderRadius: '0 0 8px 8px' }}>
                          WINNER ✓
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <Icon size={24} color={s.color} />
                        <h3 style={{ fontSize: '1rem', color: s.color }}>{s.label}</h3>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.5 }}>{s.desc}</p>

                      {[
                        { label: 'Months to Debt-Free', val: `${s.result.months} mo`, color: s.color },
                        { label: 'Total Interest Paid', val: FMT(s.result.totalInterestPaid), color: 'var(--accent)' },
                        { label: 'vs Minimum Only', val: `${minimum.months - s.result.months} months faster`, color: 'var(--secondary)' },
                      ].map(({ label, val, color }) => (
                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid var(--glass-border)', fontSize: '0.85rem' }}>
                          <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                          <span style={{ fontWeight: 700, color }}>{val}</span>
                        </div>
                      ))}

                      <div style={{ marginTop: '1rem' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>PAYOFF ORDER</p>
                        {s.order.map((name, i) => (
                          <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                            <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800, color: 'white', flexShrink: 0 }}>{i + 1}</div>
                            <span style={{ fontSize: '0.82rem', color: 'var(--text-main)' }}>{name}</span>
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop: '1rem', padding: '0.5rem 0.75rem', background: `${s.color}15`, borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: s.color, fontWeight: 600 }}>{s.tag}</div>
                    </div>
                  );
                })}
              </div>

              {/* Timeline Chart */}
              <div className="glass-panel">
                <button onClick={() => setShowChart(v => !v)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', background: 'none', border: 'none', cursor: 'pointer', marginBottom: showChart ? '1.5rem' : 0 }}>
                  <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <BarChart3 size={18} color="var(--primary)" /> Payoff Timeline Chart
                  </h3>
                  {showChart ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                </button>

                {showChart && (
                  <>
                    <TimelineChart avalanche={avalanche.balanceByMonth} snowball={snowball.balanceByMonth} minimum={minimum.balanceByMonth} />
                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
                      {[
                        { color: 'var(--secondary)', label: 'Avalanche', dashed: false },
                        { color: '#f59e0b', label: 'Snowball', dashed: false },
                        { color: '#94a3b8', label: 'Minimum Payments Only', dashed: true },
                      ].map(({ color, label, dashed }) => (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: '24px', height: '3px', background: color, borderRadius: '99px', borderTop: dashed ? `2px dashed ${color}` : undefined, opacity: dashed ? 0.7 : 1 }} />
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{label}</span>
                        </div>
                      ))}
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1rem', fontStyle: 'italic' }}>
                      Chart shows total outstanding balance across all debts month by month. The faster a line reaches ₹0, the better the strategy.
                    </p>
                  </>
                )}
              </div>

              {/* Minimum baseline row */}
              <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', background: 'rgba(148,163,184,0.06)', border: '1px solid rgba(148,163,184,0.2)' }}>
                <div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>Minimum Payments Only (Baseline)</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>What happens if you only pay the minimums every month</p>
                </div>
                <div style={{ display: 'flex', gap: '2rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Months</p>
                    <p style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)' }}>{minimum.months}</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Interest</p>
                    <p style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--accent)' }}>{FMT(minimum.totalInterestPaid)}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
