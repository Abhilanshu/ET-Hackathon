import { useState, useMemo } from 'react';
import { GraduationCap, Target, Info } from 'lucide-react';

interface CareerPreset {
  key: string;
  label: string;
  defaultCost: number;
}

const PRESETS: CareerPreset[] = [
  { key: 'eng_india', label: 'Engineering (India)', defaultCost: 1200000 },
  { key: 'eng_abroad', label: 'Engineering (Abroad/US)', defaultCost: 12000000 },
  { key: 'med_india', label: 'Medicine / MBBS (India Private)', defaultCost: 8000000 },
  { key: 'med_abroad', label: 'Medicine (Abroad/US/UK)', defaultCost: 25000000 },
  { key: 'mba_india', label: 'MBA (IIMs / Tier 1 India)', defaultCost: 25000000 },
  { key: 'mba_abroad', label: 'MBA (Ivy League Abroad)', defaultCost: 15000000 },
];

const FMT = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

export default function EducationPlanner() {
  const [careerKey, setCareerKey] = useState<string>(PRESETS[0].key);
  const [costOverride, setCostOverride] = useState<number>(1200000);
  const [years, setYears] = useState<number>(12); // years to college
  const [eduInflation, setEduInflation] = useState<number>(10); // 10% educational inflation

  // Handle preset change
  const handlePresetChange = (key: string) => {
    setCareerKey(key);
    const cost = PRESETS.find(p => p.key === key)?.defaultCost || 1200000;
    setCostOverride(cost);
  };

  // Calculations
  const compoundedCost = useMemo(() => {
    return costOverride * Math.pow(1 + eduInflation / 100, years);
  }, [costOverride, eduInflation, years]);

  const requiredSIP = useMemo(() => {
    const rate = 0.12; // 12% expected SIP return
    const monthlyRate = rate / 12;
    const totalMonths = years * 12;

    if (totalMonths <= 0) return 0;

    // Standard annuity formula for future value of SIP
    // FV = SIP * [((1 + r)^n - 1) / r] * (1 + r)
    const factor = ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate);
    return compoundedCost / factor;
  }, [compoundedCost, years]);

  // Glide path recommendation
  const glidePath = useMemo(() => {
    if (years <= 3) {
      return {
        strategy: 'Capital Preservation (Conservative)',
        allocation: '20% Equity / 80% Debt & Fixed Deposits',
        advice: 'Since college is under 3 years away, lock in your gains. Liquidate volatile equities and shift capital to low-risk Fixed Deposits or Liquid Funds to guarantee fee availability.'
      };
    } else if (years <= 6) {
      return {
        strategy: 'Hybrid Rebalancing (Moderate)',
        allocation: '50% Equity / 50% Debt & Arbitrage Funds',
        advice: 'Maintain a hybrid split. Rebalance yearly, gradually trimming equities and feeding debt instruments to shield your target corpus from early corrections.'
      };
    } else {
      return {
        strategy: 'Wealth Compounding (Aggressive)',
        allocation: '80% Equity (Nifty Index / Large & Midcap) / 20% Debt',
        advice: 'With a long runway, maximize equity compounding. Maximize investments in low-cost Nifty index funds to outpace the aggressive educational inflation rate.'
      };
    }
  }, [years]);

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <GraduationCap size={40} color="var(--primary)" />
          <span>Education <span className="text-gradient">Planner</span></span>
        </h1>
        <p style={{ marginTop: '0.5rem', fontSize: '1.1rem' }}>
          Plan for child education tuition fees compounding at real education-specific inflation rates. Define target-year glide paths.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* ── Left Column: Config Panel ── */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Goal Parameters</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Select Target Career Path</label>
            <select
              value={careerKey}
              onChange={e => handlePresetChange(e.target.value)}
              style={{ padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)' }}
            >
              {PRESETS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Estimated Current Cost (₹)</label>
            <input
              type="number"
              value={costOverride}
              onChange={e => setCostOverride(Number(e.target.value))}
              style={{ padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)' }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Default value matches average Indian/International fees today.</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Years until College: {years} years</label>
            <input type="range" min="1" max="18" step="1" value={years} onChange={e => setYears(Number(e.target.value))} style={{ cursor: 'pointer' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Education Inflation Rate: {eduInflation}%</label>
            <input type="range" min="6" max="14" step="0.5" value={eduInflation} onChange={e => setEduInflation(Number(e.target.value))} style={{ cursor: 'pointer' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Note: Education inflation typically runs at 10-12%, far higher than retail CPI.</span>
          </div>
        </div>

        {/* ── Right Column: Outputs ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Target Valuation & Required SIP */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="glass-panel" style={{ borderTop: '4px solid var(--accent)' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Compounded Future Cost</p>
              <h2 style={{ fontSize: '2.2rem', color: 'var(--accent)' }}>{FMT(compoundedCost)}</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Inflation turns today's {FMT(costOverride)} into this sum in {years} years.
              </p>
            </div>

            <div className="glass-panel" style={{ borderTop: '4px solid var(--secondary)' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Required Monthly SIP</p>
              <h2 style={{ fontSize: '2.2rem', color: 'var(--secondary)' }}>{FMT(requiredSIP)}</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Assuming a conservative 12% CAGR equity return over the horizon.
              </p>
            </div>
          </div>

          {/* Asset Glide Path Recommendation */}
          <div className="glass-panel" style={{ borderLeft: '4px solid var(--primary)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', fontSize: '1.1rem' }}>
              <Target color="var(--primary)" size={20} /> Target Asset Glide Path
            </h3>

            <div style={{ background: 'var(--bg-light-elem)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Target Strategy</span>
                <strong style={{ color: 'var(--primary)' }}>{glidePath.strategy}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Recommended Allocation</span>
                <strong style={{ color: 'var(--text-main)' }}>{glidePath.allocation}</strong>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginTop: '0.25rem' }}>
                {glidePath.advice}
              </p>
            </div>
          </div>

          {/* Education cost details explanation */}
          <div className="glass-panel" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', background: 'rgba(255,255,255,0.02)' }}>
            <Info size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>Why Educational Inflation is a Silent Wealth Killer</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                While general CPI items (food, clothing) inflates at 5-6%, premium education costs compound globally at 10-12%. If you plan using a simple 6% inflation target, your education fund will end up with a **45% deficit** on the college admission date, forcing premature equity liquidations or high-interest study loans.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
