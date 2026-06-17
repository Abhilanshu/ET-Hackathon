import { useState, useEffect, useMemo } from 'react';
import { Scale, RefreshCw, AlertTriangle, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Allocation {
  equity: number;
  debt: number;
  gold: number;
  cash: number;
}

const PRESETS: Record<'aggressive' | 'balanced' | 'conservative', Allocation> = {
  aggressive: { equity: 80, debt: 10, gold: 5, cash: 5 },
  balanced: { equity: 50, debt: 35, gold: 10, cash: 5 },
  conservative: { equity: 30, debt: 50, gold: 10, cash: 10 },
};

const FMT = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

export default function PortfolioRebalancer() {
  const { portfolio } = useAuth();
  
  const [profile, setProfile] = useState<'aggressive' | 'balanced' | 'conservative' | 'custom'>('balanced');
  const [customTarget, setCustomTarget] = useState<Allocation>({ equity: 50, debt: 35, gold: 10, cash: 5 });
  const [currentAlloc, setCurrentAlloc] = useState<Allocation>({ equity: 1500000, debt: 800000, gold: 300000, cash: 200000 });

  // Load from actual user inputs
  useEffect(() => {
    // 1. Fetch values from connected bank/portfolio
    let cashVal = 150000; // opening cash
    let debtVal = 400000; // default EPF/PPF debt
    let equityVal = 800000; // default mutual funds

    if (portfolio?.totalCorpus) {
      // split total corpus realistically into equity/debt if bank connected
      equityVal = portfolio.totalCorpus * 0.6;
      debtVal = portfolio.totalCorpus * 0.35;
      cashVal = portfolio.totalCorpus * 0.05;
    }

    // 2. Fetch stocks from investments tracker
    const savedStocks = localStorage.getItem('mentorai_investments_stocks');
    if (savedStocks) {
      try {
        const parsed = JSON.parse(savedStocks);
        const stocksValue = parsed.reduce((sum: number, s: any) => sum + (s.currentPrice * s.shares), 0);
        equityVal += stocksValue;
      } catch (e) { console.error(e); }
    }

    // 3. Fetch gold from investments tracker
    const savedGold = localStorage.getItem('mentorai_investments_gold');
    let goldVal = 180000; // default gold if empty
    if (savedGold) {
      try {
        const parsed = JSON.parse(savedGold);
        goldVal = parsed.grams * 7250; // multiply by current market price
      } catch (e) { console.error(e); }
    }

    setCurrentAlloc({
      equity: equityVal,
      debt: debtVal,
      gold: goldVal,
      cash: cashVal,
    });
  }, [portfolio]);

  const target = useMemo(() => {
    if (profile === 'custom') return customTarget;
    return PRESETS[profile];
  }, [profile, customTarget]);

  const totalValue = useMemo(() => {
    return currentAlloc.equity + currentAlloc.debt + currentAlloc.gold + currentAlloc.cash;
  }, [currentAlloc]);

  const currentPct = useMemo(() => {
    if (totalValue <= 0) return { equity: 0, debt: 0, gold: 0, cash: 0 };
    return {
      equity: (currentAlloc.equity / totalValue) * 100,
      debt: (currentAlloc.debt / totalValue) * 100,
      gold: (currentAlloc.gold / totalValue) * 100,
      cash: (currentAlloc.cash / totalValue) * 100,
    };
  }, [currentAlloc, totalValue]);

  // Rebalancing transactions
  const actions = useMemo(() => {
    const transactions: { asset: string; type: 'buy' | 'sell'; amount: number }[] = [];
    
    const targetVal = {
      equity: (target.equity / 100) * totalValue,
      debt: (target.debt / 100) * totalValue,
      gold: (target.gold / 100) * totalValue,
      cash: (target.cash / 100) * totalValue,
    };

    const diffs = {
      equity: targetVal.equity - currentAlloc.equity,
      debt: targetVal.debt - currentAlloc.debt,
      gold: targetVal.gold - currentAlloc.gold,
      cash: targetVal.cash - currentAlloc.cash,
    };

    // Threshold filter: ignore tiny differences under 2% of total portfolio or under ₹10,000
    const thresholdVal = Math.max(10000, totalValue * 0.02);

    Object.entries(diffs).forEach(([key, diff]) => {
      if (Math.abs(diff) >= thresholdVal) {
        transactions.push({
          asset: key.charAt(0).toUpperCase() + key.slice(1),
          type: diff > 0 ? 'buy' : 'sell',
          amount: Math.abs(diff),
        });
      }
    });

    return transactions;
  }, [currentAlloc, target, totalValue]);

  // Tax and Cost estimation
  const totalTaxAndFees = useMemo(() => {
    let tax = 0;
    let exitLoad = 0;

    actions.forEach(act => {
      if (act.type === 'sell') {
        if (act.asset === 'Equity') {
          // Assume 60% of sells are long-term (exempt up to ₹1.25L, then 10%), STCG is 20%.
          // Simplified projection: blended tax of 12% on equity sale profits (assuming 25% of sale is profit)
          const profit = act.amount * 0.25;
          tax += profit * 0.12;
          exitLoad += act.amount * 0.005; // 0.5% exit load estimate
        } else if (act.asset === 'Gold') {
          // Gold taxed at slab or 20% indexation. Blended projection: 15% on 20% profits
          tax += (act.amount * 0.2) * 0.15;
        } else if (act.asset === 'Debt') {
          // Debt taxed at slab. Blended projection: 30% slab rate on 15% profits
          tax += (act.amount * 0.15) * 0.30;
        }
      }
    });

    return { tax, exitLoad };
  }, [actions]);

  // SVGs for visual Donut comparison
  const drawDonut = (alloc: Allocation) => {
    let cumulative = 0;
    const size = 160;
    const r = 50;
    const cx = size / 2;
    const cy = size / 2;
    const circ = 2 * Math.PI * r;

    const sectors = [
      { key: 'equity', color: '#f97316', label: 'Equity' },
      { key: 'debt', color: '#10b981', label: 'Debt' },
      { key: 'gold', color: '#eab308', label: 'Gold' },
      { key: 'cash', color: '#3b82f6', label: 'Cash' },
    ];

    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r} fill="transparent" stroke="var(--bg-light-elem)" strokeWidth="16" />
        {sectors.map(s => {
          const val = alloc[s.key as keyof Allocation];
          if (val <= 0) return null;
          const strokeVal = (val / 100) * circ;
          const strokeOffset = circ - (cumulative / 100) * circ;
          cumulative += val;
          return (
            <circle
              key={s.key}
              cx={cx}
              cy={cy}
              r={r}
              fill="transparent"
              stroke={s.color}
              strokeWidth="16"
              strokeDasharray={`${strokeVal} ${circ - strokeVal}`}
              strokeDashoffset={strokeOffset}
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          );
        })}
        <circle cx={cx} cy={cy} r={r - 12} fill="var(--bg-light)" />
        <text x={cx} y={cy + 4} textAnchor="middle" fontSize="12" fontWeight="800" fill="var(--text-main)">
          {FMT(totalValue).split('.')[0]}
        </text>
      </svg>
    );
  };

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Scale size={40} color="var(--primary)" />
          <span>Asset Allocation <span className="text-gradient">Rebalancer</span></span>
        </h1>
        <p style={{ marginTop: '0.5rem', fontSize: '1.1rem' }}>
          Rebalance your portfolio splits across Stocks, Fixed Income, Gold, and Cash dynamically to contain risk.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Current Allocation Panel */}
        <div className="glass-panel" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Current Allocation</h3>
            {drawDonut(currentPct)}
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { label: 'Equity (Stocks/MF)', val: currentAlloc.equity, pct: currentPct.equity, color: '#f97316' },
              { label: 'Debt (EPF/PPF/Bonds)', val: currentAlloc.debt, pct: currentPct.debt, color: '#10b981' },
              { label: 'Gold (Jewelry/SGB)', val: currentAlloc.gold, pct: currentPct.gold, color: '#eab308' },
              { label: 'Cash & Liquid Funds', val: currentAlloc.cash, pct: currentPct.cash, color: '#3b82f6' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }} />
                  {item.label}
                </span>
                <span style={{ fontWeight: 700 }}>{FMT(item.val)} ({item.pct.toFixed(0)}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Target Strategy Picker */}
        <div className="glass-panel">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Choose Target Profile</h3>
          
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {(['aggressive', 'balanced', 'conservative'] as const).map(p => (
              <button 
                key={p} 
                onClick={() => setProfile(p)}
                className="btn btn-outline"
                style={{ 
                  flex: 1, 
                  padding: '0.5rem 0.75rem', 
                  fontSize: '0.85rem',
                  background: profile === p ? 'var(--primary)' : 'transparent',
                  color: profile === p ? 'white' : 'var(--text-main)',
                  border: '1px solid var(--glass-border)',
                  textTransform: 'capitalize'
                }}
              >
                {p}
              </button>
            ))}
            <button 
              onClick={() => setProfile('custom')}
              className="btn btn-outline"
              style={{ 
                flex: 1, 
                padding: '0.5rem 0.75rem', 
                fontSize: '0.85rem',
                background: profile === 'custom' ? 'var(--primary)' : 'transparent',
                color: profile === 'custom' ? 'white' : 'var(--text-main)',
                border: '1px solid var(--glass-border)'
              }}
            >
              Custom
            </button>
          </div>

          {profile === 'custom' ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
              {Object.entries(customTarget).map(([key, val]) => (
                <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span style={{ textTransform: 'capitalize', color: 'var(--text-muted)' }}>{key} (%)</span>
                  <input
                    type="number"
                    value={val || ''}
                    onChange={e => setCustomTarget({ ...customTarget, [key]: Number(e.target.value) })}
                    style={{ padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)' }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
              {drawDonut(PRESETS[profile])}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                {Object.entries(PRESETS[profile]).map(([key, pct]) => (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ textTransform: 'capitalize', color: 'var(--text-muted)' }}>{key} Target</span>
                    <span style={{ fontWeight: 700 }}>{pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }}>
        {/* Actions Checklist */}
        <div className="glass-panel">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <RefreshCw size={20} color="var(--primary)" /> Actionable Rebalancing Plan
          </h3>

          {actions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <CheckCircle2 size={48} color="var(--secondary)" style={{ margin: '0 auto 1rem' }} />
              <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>Your Portfolio is Balanced!</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Current deviations are within the safe threshold limit (2%). No actions needed.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {actions.map((act, i) => (
                <div 
                  key={i} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '1rem 1.5rem', 
                    background: 'var(--bg-light-elem)', 
                    borderRadius: 'var(--radius-md)', 
                    border: '1px solid var(--glass-border)',
                    borderLeft: `5px solid ${act.type === 'buy' ? 'var(--secondary)' : 'var(--accent)'}`
                  }}
                >
                  <div>
                    <span 
                      style={{ 
                        fontSize: '0.75rem', 
                        background: act.type === 'buy' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)', 
                        color: act.type === 'buy' ? 'var(--secondary)' : 'var(--accent)', 
                        padding: '0.2rem 0.5rem', 
                        borderRadius: '50px', 
                        fontWeight: 700, 
                        textTransform: 'uppercase',
                        marginRight: '0.5rem'
                      }}
                    >
                      {act.type}
                    </span>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>{act.asset}</strong>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      {act.type === 'sell' 
                        ? `Liquidate redundant ${act.asset} investments to unlock capital`
                        : `Reinvest capital into target-safe ${act.asset} instruments`}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: act.type === 'buy' ? 'var(--secondary)' : 'var(--accent)' }}>
                      {FMT(act.amount)}
                    </span>
                    <ArrowRight size={16} color="var(--text-muted)" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cost & Regulation Advisor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ borderLeft: '4px solid var(--accent)' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-main)' }}>
              <AlertTriangle color="var(--accent)" size={18} /> Tax & Fee Drag Estimator
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Est. Exit Load (0.5-1% dynamic)</span>
                <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{FMT(totalTaxAndFees.exitLoad)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Projected Capital Gains Tax</span>
                <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{FMT(totalTaxAndFees.tax)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.25rem' }}>
                <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Total Rebalance Drag</span>
                <span style={{ fontWeight: 800, color: 'var(--accent)', fontSize: '1rem' }}>
                  {FMT(totalTaxAndFees.tax + totalTaxAndFees.exitLoad)}
                </span>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--secondary)' }}>
              <ShieldCheck size={18} /> Smart Safeguards
            </h4>
            <ul style={{ paddingLeft: '1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem', lineHeight: 1.5 }}>
              <li><strong>Band Rebalancing</strong>: Only trigger sell orders if an asset class drifts by more than 5% from its target split. This eliminates transaction fee waste.</li>
              <li><strong>Tax-Loss Offset</strong>: If selling equities at a loss, declare it in your income tax returns to carry forward losses.</li>
              <li><strong>SIP Redirecting</strong>: Instead of selling assets (triggering tax), simply redirect future SIPs to target underweight assets.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
