import { useState, useMemo } from 'react';
import { LineChart, ShieldCheck, ChevronRight, Activity } from 'lucide-react';

interface SimulationRow {
  year: number;
  opening: number;
  withdrawal: number;
  returns: number;
  closing: number;
}

const FMT = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

export default function DrawdownSimulator() {
  const [corpus, setCorpus] = useState<number>(30000000); // ₹3Cr
  const [monthlyExpense, setMonthlyExpense] = useState<number>(100000); // ₹1L
  const [inflation, setInflation] = useState<number>(6); // 6% inflation
  const [equitySplit, setEquitySplit] = useState<number>(40); // 40% equity, 60% debt/cash in retirement
  const [longevity, setLongevity] = useState<number>(35); // 35 years
  const [scenario, setScenario] = useState<'normal' | 'optimistic' | 'crash'>('normal');

  // Year-by-year simulation
  const simulationData = useMemo(() => {
    const rows: SimulationRow[] = [];
    let currentBalance = corpus;
    let annualWithdrawal = monthlyExpense * 12;

    const equityReturn = scenario === 'optimistic' ? 0.12 : 0.10;
    const debtReturn = scenario === 'optimistic' ? 0.07 : 0.06;

    for (let y = 1; y <= longevity; y++) {
      if (currentBalance <= 0) {
        rows.push({ year: y, opening: 0, withdrawal: 0, returns: 0, closing: 0 });
        continue;
      }

      const opening = currentBalance;
      
      // Calculate growth returns (blended rate based on equity split)
      let rate = (equitySplit / 100) * equityReturn + (1 - equitySplit / 100) * debtReturn;

      // sequence of returns risk (early market crash scenario)
      if (scenario === 'crash') {
        if (y === 1) {
          // Equity crashes 30% in year 1
          rate = (equitySplit / 100) * (-0.30) + (1 - equitySplit / 100) * debtReturn;
        } else if (y === 2) {
          // Equity drops another 10% in year 2
          rate = (equitySplit / 100) * (-0.10) + (1 - equitySplit / 100) * debtReturn;
        } else if (y === 3) {
          // Flat year 3
          rate = (equitySplit / 100) * 0.02 + (1 - equitySplit / 100) * debtReturn;
        }
      }

      // Withdraw at the start of the year
      const withdrawal = Math.min(opening, annualWithdrawal);
      const activeCorpus = opening - withdrawal;

      const returns = activeCorpus * rate;
      const closing = Math.max(0, activeCorpus + returns);

      rows.push({
        year: y,
        opening: Math.round(opening),
        withdrawal: Math.round(withdrawal),
        returns: Math.round(returns),
        closing: Math.round(closing)
      });

      currentBalance = closing;
      // Adjust withdrawal for inflation for the next year
      annualWithdrawal *= (1 + inflation / 100);
    }

    return rows;
  }, [corpus, monthlyExpense, inflation, equitySplit, longevity, scenario]);

  const initialSWR = useMemo(() => {
    const annual = monthlyExpense * 12;
    return corpus > 0 ? (annual / corpus) * 100 : 0;
  }, [monthlyExpense, corpus]);

  const depletionYear = useMemo(() => {
    const idx = simulationData.findIndex(r => r.closing <= 0);
    return idx === -1 ? null : idx + 1;
  }, [simulationData]);

  // Chart plotting
  const chartWidth = 500;
  const chartHeight = 180;
  const padding = 35;

  const points = useMemo(() => {
    if (simulationData.length === 0) return '';
    const maxBal = corpus;
    const xScale = (y: number) => padding + ((y - 1) / (longevity - 1)) * (chartWidth - padding * 2);
    const yScale = (v: number) => padding + (1 - v / maxBal) * (chartHeight - padding * 2);

    return simulationData
      .map(r => `${xScale(r.year)},${yScale(r.closing)}`)
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p}`)
      .join(' ');
  }, [simulationData, longevity, corpus]);

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Activity size={40} color="var(--primary)" />
          <span>FIRE Drawdown <span className="text-gradient">Simulator</span></span>
        </h1>
        <p style={{ marginTop: '0.5rem', fontSize: '1.1rem' }}>
          Stress-test your post-retirement SWR longevity and evaluate sequence of returns risk (SRR) during market crashes.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* ── Left Column: Config Panel ── */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Retirement Inputs</h3>
          
          {[
            { label: 'Retirement Corpus (₹)', val: corpus, set: setCorpus, step: 1000000 },
            { label: 'Initial Monthly Budget (₹)', val: monthlyExpense, set: setMonthlyExpense, step: 5000 },
          ].map(({ label, val, set, step }) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{label}</label>
              <input
                type="number"
                step={step}
                value={val}
                onChange={e => set(Number(e.target.value))}
                style={{ padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)' }}
              />
            </div>
          ))}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Inflation Rate: {inflation}%</label>
            <input type="range" min="4" max="10" step="0.5" value={inflation} onChange={e => setInflation(Number(e.target.value))} style={{ cursor: 'pointer' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Longevity Horizon: {longevity} years</label>
            <input type="range" min="15" max="50" step="1" value={longevity} onChange={e => setLongevity(Number(e.target.value))} style={{ cursor: 'pointer' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Equity Allocation: {equitySplit}%</label>
            <input type="range" min="10" max="80" step="5" value={equitySplit} onChange={e => setEquitySplit(Number(e.target.value))} style={{ cursor: 'pointer' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Balance ({100 - equitySplit}%) in fixed income/liquid debt.</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Market Scenario</label>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              {(['normal', 'optimistic', 'crash'] as const).map(sc => (
                <button
                  key={sc}
                  onClick={() => setScenario(sc)}
                  className="btn btn-outline"
                  style={{
                    flex: 1,
                    padding: '0.5rem 0.25rem',
                    fontSize: '0.8rem',
                    background: scenario === sc ? 'var(--primary)' : 'transparent',
                    color: scenario === sc ? 'white' : 'var(--text-main)',
                    border: '1px solid var(--glass-border)'
                  }}
                >
                  {sc === 'crash' ? 'Crash Y1-3' : sc}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right Column: Charts & Metrics ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* SWR Metric & Longevity Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* SWR Health */}
            <div className="glass-panel" style={{ borderLeft: `4px solid ${initialSWR <= 4 ? 'var(--secondary)' : 'var(--accent)'}` }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Initial SWR (Withdrawal Rate)</p>
              <h2 style={{ color: initialSWR <= 4 ? 'var(--secondary)' : 'var(--accent)', fontSize: '2.2rem' }}>{initialSWR.toFixed(2)}%</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                {initialSWR <= 4.0 
                  ? 'Safe: Under the historical 4% standard rule-of-thumb.' 
                  : 'Caution: Exceeds 4% safety limit. Risk of early depletion.'}
              </p>
            </div>

            {/* Survivability */}
            <div className="glass-panel" style={{ borderLeft: `4px solid ${depletionYear ? 'var(--accent)' : 'var(--secondary)'}` }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Corpus Survivability</p>
              <h2 style={{ color: depletionYear ? 'var(--accent)' : 'var(--secondary)', fontSize: '2.2rem' }}>
                {depletionYear ? `Depleted in Yr ${depletionYear}` : 'Outlasts Horizon'}
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                {depletionYear 
                  ? `Your retirement fund runs dry in year ${depletionYear}.` 
                  : 'Portfolio safely survives the entire targeted longevity horizon.'}
              </p>
            </div>
          </div>

          {/* SVG Chart Trajectory */}
          <div className="glass-panel">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
              <LineChart size={18} color="var(--primary)" /> Portfolio Longevity Curve
            </h3>

            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
              {/* grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map(pct => (
                <g key={pct}>
                  <line x1={padding} y1={padding + pct * (chartHeight - padding * 2)} x2={chartWidth - padding} y2={padding + pct * (chartHeight - padding * 2)} stroke="rgba(0,0,0,0.06)" strokeWidth="1" />
                  <text x={padding - 6} y={padding + pct * (chartHeight - padding * 2) + 4} fontSize="8" fill="var(--text-muted)" textAnchor="end">
                    {FMT(corpus * (1 - pct)).split('.')[0]}
                  </text>
                </g>
              ))}
              {/* curve */}
              {points && <path d={points} stroke={depletionYear ? 'var(--accent)' : 'var(--secondary)'} strokeWidth="3" fill="none" />}
              {/* axis */}
              <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="var(--glass-border)" />
              {/* labels */}
              {[1, Math.round(longevity / 2), longevity].map(y => (
                <text key={y} x={padding + ((y - 1) / (longevity - 1)) * (chartWidth - padding * 2)} y={chartHeight - padding + 15} fontSize="8" fill="var(--text-muted)" textAnchor="middle">
                  Yr {y}
                </text>
              ))}
            </svg>
          </div>

          {/* Drawdown plan suggestions */}
          <div className="glass-panel">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <ShieldCheck color="var(--secondary)" size={20} /> MentorAI Drawdown Strategy
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { 
                  title: 'Mitigate Sequence Risk via Cash Bucket', 
                  desc: 'Maintain 3 years of expenses in high-yield liquid mutual funds or FDs. When stocks crash, withdraw from the Cash Bucket instead of selling equities at a loss. This lets equities recover.' 
                },
                { 
                  title: 'Adopt Dynamic Spending Rules', 
                  desc: 'If Nifty drops over 20%, enforce a Guardrail Spending Cut: reduce non-essential expenses by 10% to preserve the corpus compounding power.' 
                },
                { 
                  title: 'Order of Decumulation', 
                  desc: 'Optimal liquidation priority: 1) Cash/Bonds interest payout, 2) Dividend yield, 3) Debt assets liquidation, and finally 4) Equity gains harvest.' 
                }
              ].map((rec, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', background: 'var(--bg-light-elem)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)' }}>
                  <ChevronRight size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)', display: 'block', marginBottom: '0.2rem' }}>{rec.title}</strong>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{rec.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
