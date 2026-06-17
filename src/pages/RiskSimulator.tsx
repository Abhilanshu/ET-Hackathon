import { useState, useEffect, useMemo } from 'react';
import { Activity, ShieldAlert, TrendingDown, Compass, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface CrisisScenario {
  key: string;
  name: string;
  equityReturn: number; // e.g. -0.50
  debtReturn: number;   // e.g. +0.08
  goldReturn: number;   // e.g. +0.20
  cashReturn: number;   // e.g. +0.05
  description: string;
  relevance: string;
}

const CRISES: CrisisScenario[] = [
  {
    key: 'lehman_2008',
    name: '2008 Subprime Collapse (Lehman Crisis)',
    equityReturn: -0.50,
    debtReturn: 0.08,
    goldReturn: 0.20,
    cashReturn: 0.05,
    description: 'Systemic banking collapse triggers global recession. Equities crash 50%, but safety assets (Debt) and safe-haven hedges (Gold) rally.',
    relevance: 'Tests if you have enough non-equity liquidity to survive a prolonged 24-month market bottom without selling stocks at the absolute low.'
  },
  {
    key: 'covid_2020',
    name: '2020 Pandemic Panic (COVID Crash)',
    equityReturn: -0.35,
    debtReturn: 0.06,
    goldReturn: 0.15,
    cashReturn: 0.04,
    description: 'Global lockdowns trigger rapid liquidity freeze. Equities drop 35% in 4 weeks. Gold rises as central banks print massive stimulus.',
    relevance: 'Simulates short-term panic selling events and flash-crashes. Focuses on emergency fund readiness.'
  },
  {
    key: 'stagflation_1970',
    name: '1970s High-Inflation Stagflation',
    equityReturn: -0.10,
    debtReturn: 0.04,
    goldReturn: 0.45,
    cashReturn: 0.03,
    description: 'Supply shocks drive persistent inflation. Debt and cash lose real purchasing power (negative real yield). Gold surges by 45% as the ultimate hedge.',
    relevance: 'Proves how physical gold hedges protect purchasing power when inflation eats banking fixed income.'
  }
];

const FMT = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

export default function RiskSimulator() {
  const { portfolio, userKey } = useAuth();
  const STOCKS_KEY = userKey('investments_stocks');
  const GOLD_KEY = userKey('investments_gold');
  
  const [selectedCrisisKey, setSelectedCrisisKey] = useState<string>(CRISES[0].key);
  const [customLoss, setCustomLoss] = useState<number>(30); // 30% drop custom slider
  const [customInflation, setCustomInflation] = useState<number>(7); // 7% custom inflation slider
  const [mode, setMode] = useState<'historical' | 'custom'>('historical');
  const [run, setRun] = useState(false);

  // User asset splits
  const [portfolioSplits, setPortfolioSplits] = useState({
    equity: 1200000,
    debt: 600000,
    gold: 300000,
    cash: 150000
  });

  useEffect(() => {
    let cashVal = 150000;
    let debtVal = 400000;
    let equityVal = 800000;

    if (portfolio?.totalCorpus) {
      equityVal = portfolio.totalCorpus * 0.60;
      debtVal = portfolio.totalCorpus * 0.35;
      cashVal = portfolio.totalCorpus * 0.05;
    }

    const savedStocks = localStorage.getItem(STOCKS_KEY);
    if (savedStocks) {
      try {
        const parsed = JSON.parse(savedStocks);
        equityVal += parsed.reduce((sum: number, s: any) => sum + (s.currentPrice * s.shares), 0);
      } catch (e) { console.error(e); }
    }

    const savedGold = localStorage.getItem(GOLD_KEY);
    let goldVal = 180000;
    if (savedGold) {
      try {
        const parsed = JSON.parse(savedGold);
        goldVal = parsed.grams * 7250;
      } catch (e) { console.error(e); }
    }

    setPortfolioSplits({
      equity: equityVal,
      debt: debtVal,
      gold: goldVal,
      cash: cashVal
    });
  }, [portfolio, STOCKS_KEY, GOLD_KEY]);

  const totalPortfolioValue = useMemo(() => {
    return portfolioSplits.equity + portfolioSplits.debt + portfolioSplits.gold + portfolioSplits.cash;
  }, [portfolioSplits]);

  const activeCrisis = useMemo(() => {
    return CRISES.find(c => c.key === selectedCrisisKey) || CRISES[0];
  }, [selectedCrisisKey]);

  // Calculations for simulated impacts
  const simulationResults = useMemo(() => {
    let eqChange = 0;
    let debtChange = 0;
    let goldChange = 0;
    let cashChange = 0;
    let inflRate = 6;

    if (mode === 'historical') {
      eqChange = activeCrisis.equityReturn;
      debtChange = activeCrisis.debtReturn;
      goldChange = activeCrisis.goldReturn;
      cashChange = activeCrisis.cashReturn;
      // inflation proxy based on historical records
      inflRate = activeCrisis.key === 'stagflation_1970' ? 10 : 6;
    } else {
      eqChange = -(customLoss / 100);
      debtChange = 0.06; // standard flat safe returns
      goldChange = (customLoss * 0.4) / 100; // gold rises proportionally to market crashes
      cashChange = 0.04;
      inflRate = customInflation;
    }

    const newEq = portfolioSplits.equity * (1 + eqChange);
    const newDebt = portfolioSplits.debt * (1 + debtChange);
    const newGold = portfolioSplits.gold * (1 + goldChange);
    const newCash = portfolioSplits.cash * (1 + cashChange);

    const endingTotalVal = newEq + newDebt + newGold + newCash;
    const netLoss = totalPortfolioValue - endingTotalVal;

    // Inflation effect (5 year purchasing power loss on cash + debt)
    const inflationFactor = Math.pow(1 + inflRate / 100, 5);
    const futureDebtCashPower = (newDebt + newCash) / inflationFactor;
    const purchasingPowerLoss = (newDebt + newCash) - futureDebtCashPower;

    // Hedging offsets (money saved by NOT having 100% equity)
    const allEquityCrashVal = totalPortfolioValue * (1 + eqChange);
    const hedgeOffsetBenefit = endingTotalVal - allEquityCrashVal;

    return {
      endingTotalVal,
      netLoss,
      purchasingPowerLoss,
      hedgeOffsetBenefit,
      eqChange,
      debtChange,
      goldChange,
      cashChange,
      newEq,
      newDebt,
      newGold,
      newCash,
      inflRate
    };
  }, [mode, activeCrisis, customLoss, customInflation, portfolioSplits, totalPortfolioValue]);

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Activity size={40} color="var(--primary)" />
          <span>Risk Simulation <span className="text-gradient">Engine</span></span>
        </h1>
        <p style={{ marginTop: '0.5rem', fontSize: '1.1rem' }}>
          Stress-test your Nifty Stocks and Gold splits against historical crashes or custom macroeconomic shocks.
        </p>
      </div>

      {/* Simulator Config */}
      <div className="glass-panel" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Compass size={18} color="var(--primary)" /> Configure Macro Shock Parameter
          </h3>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {['historical', 'custom'].map((m: any) => (
              <button
                key={m}
                onClick={() => { setMode(m); setRun(false); }}
                className="btn btn-outline"
                style={{
                  padding: '0.4rem 1rem',
                  fontSize: '0.8rem',
                  background: mode === m ? 'var(--primary)' : 'transparent',
                  color: mode === m ? 'white' : 'var(--text-main)',
                  border: '1px solid var(--glass-border)',
                  textTransform: 'capitalize'
                }}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {mode === 'historical' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Select Historical Crisis Scenario</label>
              <select
                value={selectedCrisisKey}
                onChange={e => { setSelectedCrisisKey(e.target.value); setRun(false); }}
                style={{ padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)' }}
              >
                {CRISES.map(c => <option key={c.key} value={c.key}>{c.name}</option>)}
              </select>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              <strong>Description:</strong> {activeCrisis.description}
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, fontStyle: 'italic' }}>
              <strong>Why this matters:</strong> {activeCrisis.relevance}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Equity Drop Severity: -{customLoss}%</label>
              <input type="range" min="10" max="60" step="5" value={customLoss} onChange={e => { setCustomLoss(Number(e.target.value)); setRun(false); }} style={{ cursor: 'pointer' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Gold will rise by {(customLoss * 0.4).toFixed(0)}% as flight to safety.</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Annual CPI Inflation: {customInflation}%</label>
              <input type="range" min="4" max="15" step="1" value={customInflation} onChange={e => { setCustomInflation(Number(e.target.value)); setRun(false); }} style={{ cursor: 'pointer' }} />
            </div>
          </div>
        )}

        <button 
          onClick={() => setRun(true)} 
          className="btn btn-primary" 
          style={{ width: '100%', padding: '0.85rem', borderRadius: 'var(--radius-sm)', marginTop: '2rem' }}
        >
          Run Stress Test Simulation
        </button>
      </div>

      {/* Results view */}
      {run && (
        <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Main highlights */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div className="glass-panel" style={{ borderLeft: '4px solid var(--accent)' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Net Portfolio Drop</p>
              <h2 style={{ fontSize: '2.2rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <TrendingDown size={28} />
                {FMT(simulationResults.netLoss)}
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Holistic value drops from {FMT(totalPortfolioValue)} to <strong>{FMT(simulationResults.endingTotalVal)}</strong>.
              </p>
            </div>

            <div className="glass-panel" style={{ borderLeft: '4px solid var(--secondary)' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Hedge Protection Shield</p>
              <h2 style={{ fontSize: '2.2rem', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <ShieldCheck size={28} />
                +{FMT(simulationResults.hedgeOffsetBenefit)}
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Funds saved from crash due to your Gold and Fixed-income diversification hedge!
              </p>
            </div>
          </div>

          {/* Asset class breakdown list */}
          <div className="glass-panel">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Asset-Class Stress Breakdown</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {[
                { 
                  name: 'Equity (Stocks/MF)', 
                  opening: portfolioSplits.equity, 
                  closing: simulationResults.newEq, 
                  pct: simulationResults.eqChange * 100, 
                  color: '#f97316' 
                },
                { 
                  name: 'Debt & PPF', 
                  opening: portfolioSplits.debt, 
                  closing: simulationResults.newDebt, 
                  pct: simulationResults.debtChange * 100, 
                  color: '#10b981' 
                },
                { 
                  name: 'Gold Holdings', 
                  opening: portfolioSplits.gold, 
                  closing: simulationResults.newGold, 
                  pct: simulationResults.goldChange * 100, 
                  color: '#eab308' 
                },
                { 
                  name: 'Cash / Liquids', 
                  opening: portfolioSplits.cash, 
                  closing: simulationResults.newCash, 
                  pct: simulationResults.cashChange * 100, 
                  color: '#3b82f6' 
                },
              ].map(item => {
                const isPositive = item.pct >= 0;
                return (
                  <div key={item.name} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', padding: '1rem', background: 'var(--bg-light-elem)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }} />
                      {item.name}
                    </span>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.25rem' }}>
                      <span style={{ fontSize: '1rem', fontWeight: 800 }}>{FMT(item.closing)}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isPositive ? 'var(--secondary)' : 'var(--accent)' }}>
                        {isPositive ? '+' : ''}{item.pct.toFixed(0)}%
                      </span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Before: {FMT(item.opening)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Inflation shock on Cash/Debt */}
          <div className="glass-panel" style={{ borderLeft: '4px solid #fbbf24', background: 'rgba(251,191,36,0.03)' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#b45309' }}>
              <ShieldAlert size={18} color="#d97706" /> 5-Year Inflation Drag Shock
            </h4>
            <p style={{ fontSize: '0.88rem', lineHeight: 1.5, color: 'var(--text-muted)' }}>
              In addition to market drops, under {simulationResults.inflRate}% inflation, the combined purchasing power of your safe Cash and Debt drops by <strong>{FMT(simulationResults.purchasingPowerLoss)}</strong> over the next 5 years. 
              <br />
              <strong>Mitigation Advice:</strong> Do not hoard excessive cash during high-inflation cycles. Maintain Gold exposure at 5-10% to preserve real purchasing power.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
