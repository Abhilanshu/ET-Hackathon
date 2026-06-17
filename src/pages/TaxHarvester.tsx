import { useState, useEffect, useMemo } from 'react';
import { TrendingDown, Info, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AssetHolding {
  id: string;
  name: string;
  purchaseDate: string;
  purchaseNAV: number;
  currentNAV: number;
  units: number;
}

const FMT = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

export default function TaxHarvester() {
  const { userKey } = useAuth();
  const HOLDINGS_KEY = userKey('tax_harvest_holdings');
  const HARVESTED_KEY = userKey('harvested_this_year');

  const [holdings, setHoldings] = useState<AssetHolding[]>([]);

  const [harvestedThisYear, setHarvestedThisYear] = useState<number>(0);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    purchaseDate: '',
    purchaseNAV: '',
    currentNAV: '',
    units: ''
  });

  // Load from local storage or pre-populate
  useEffect(() => {
    const saved = localStorage.getItem(HOLDINGS_KEY);
    if (saved) {
      try { setHoldings(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
    const savedHarvested = localStorage.getItem(HARVESTED_KEY);
    if (savedHarvested) {
      setHarvestedThisYear(Number(savedHarvested));
    }
  }, [HOLDINGS_KEY, HARVESTED_KEY]);

  const saveHoldings = (updated: AssetHolding[]) => {
    setHoldings(updated);
    localStorage.setItem(HOLDINGS_KEY, JSON.stringify(updated));
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.purchaseDate || !form.purchaseNAV || !form.currentNAV || !form.units) return;

    const newHolding: AssetHolding = {
      id: Date.now().toString(),
      name: form.name.trim(),
      purchaseDate: form.purchaseDate,
      purchaseNAV: Number(form.purchaseNAV),
      currentNAV: Number(form.currentNAV),
      units: Number(form.units)
    };

    const updated = [...holdings, newHolding];
    saveHoldings(updated);
    setForm({ name: '', purchaseDate: '', purchaseNAV: '', currentNAV: '', units: '' });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    const updated = holdings.filter(h => h.id !== id);
    saveHoldings(updated);
  };

  const handleHarvestChange = (val: number) => {
    setHarvestedThisYear(val);
    localStorage.setItem(HARVESTED_KEY, val.toString());
  };

  // Calculations
  const calculatedHoldings = useMemo(() => {
    const today = new Date();
    return holdings.map(h => {
      const pDate = new Date(h.purchaseDate);
      const diffTime = Math.abs(today.getTime() - pDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const isLtcg = diffDays > 365;

      const totalCost = h.purchaseNAV * h.units;
      const currentValue = h.currentNAV * h.units;
      const totalGain = currentValue - totalCost;

      return {
        ...h,
        totalCost,
        currentValue,
        totalGain,
        isLtcg,
        diffDays
      };
    });
  }, [holdings]);

  // Totals
  const totals = useMemo(() => {
    let ltcg = 0;
    let stcg = 0;
    calculatedHoldings.forEach(h => {
      if (h.totalGain > 0) {
        if (h.isLtcg) ltcg += h.totalGain;
        else stcg += h.totalGain;
      }
    });
    return { ltcg, stcg };
  }, [calculatedHoldings]);

  const ltcgLimit = 125000;
  const remainingLimit = Math.max(0, ltcgLimit - harvestedThisYear);
  const potentialHarvest = Math.min(totals.ltcg, remainingLimit);
  const taxSaved = Math.round(potentialHarvest * 0.10); // 10% tax rate on LTCG in India

  const limitPct = Math.min((harvestedThisYear / ltcgLimit) * 100, 100);

  // Harvesting recommendations details
  const recommendations = useMemo(() => {
    let budgetRemaining = remainingLimit;
    const plan: { name: string; unitsToSell: number; realizedGain: number; valueToReinvest: number }[] = [];

    // Filter long-term gainers
    const ltcgGainers = calculatedHoldings
      .filter(h => h.isLtcg && h.totalGain > 0)
      .sort((a, b) => b.totalGain - a.totalGain);

    for (const h of ltcgGainers) {
      if (budgetRemaining <= 0) break;

      const gainPerUnit = h.currentNAV - h.purchaseNAV;
      if (gainPerUnit <= 0) continue;

      const targetGain = Math.min(h.totalGain, budgetRemaining);
      const unitsToSell = Math.min(h.units, targetGain / gainPerUnit);
      const realizedGain = unitsToSell * gainPerUnit;
      const valueToReinvest = unitsToSell * h.currentNAV;

      if (realizedGain >= 100) { // skip tiny fractions
        plan.push({
          name: h.name,
          unitsToSell: Math.round(unitsToSell * 100) / 100,
          realizedGain: Math.round(realizedGain),
          valueToReinvest: Math.round(valueToReinvest)
        });
        budgetRemaining -= realizedGain;
      }
    }

    return plan;
  }, [calculatedHoldings, remainingLimit]);

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <TrendingDown size={40} color="var(--primary)" />
          <span>Tax-Harvesting <span className="text-gradient">Optimizer</span></span>
        </h1>
        <p style={{ marginTop: '0.5rem', fontSize: '1.1rem' }}>
          Reset your equity cost basis tax-free by capitalizing on India's annual ₹1.25 Lakh LTCG capital gains exemption.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* ── Left Column: Config Limits & Add Holdings ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Limit Meter */}
          <div className="glass-panel" style={{ borderLeft: '4px solid var(--secondary)' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>LTCG Limit Progress</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>LTCG Already Harvested this FY (₹)</label>
              <input
                type="number"
                value={harvestedThisYear || ''}
                onChange={e => handleHarvestChange(Number(e.target.value))}
                placeholder="e.g. 20000"
                style={{ padding: '0.65rem 1rem', borderRadius: 'var(--radius-sm)' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              <span>Harvested: {FMT(harvestedThisYear)}</span>
              <span>Exempt Limit: {FMT(ltcgLimit)}</span>
            </div>

            <div style={{ height: '8px', background: 'var(--bg-light-elem)', borderRadius: '99px', overflow: 'hidden', marginBottom: '0.75rem' }}>
              <div 
                style={{ 
                  height: '100%', 
                  width: `${limitPct}%`, 
                  background: 'var(--secondary)', 
                  borderRadius: '99px' 
                }} 
              />
            </div>
            
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Remaining Tax-Free Cap: <strong>{FMT(remainingLimit)}</strong>
            </p>
          </div>

          {/* Add Holdings Form */}
          <div className="glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem' }}>Add Asset Holding</h3>
              <button onClick={() => setShowForm(v => !v)} className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>
                {showForm ? 'Cancel' : 'New'}
              </button>
            </div>

            {showForm && (
              <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <input placeholder="Scheme/Stock name e.g. UTI Nifty" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required style={{ padding: '0.6rem', borderRadius: 'var(--radius-sm)' }} />
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Purchase Date</label>
                  <input type="date" value={form.purchaseDate} onChange={e => setForm({ ...form, purchaseDate: e.target.value })} required style={{ padding: '0.6rem', borderRadius: 'var(--radius-sm)' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <input type="number" placeholder="Buy Price (₹)" value={form.purchaseNAV} onChange={e => setForm({ ...form, purchaseNAV: e.target.value })} required style={{ padding: '0.6rem', borderRadius: 'var(--radius-sm)' }} />
                  <input type="number" placeholder="Current Price (₹)" value={form.currentNAV} onChange={e => setForm({ ...form, currentNAV: e.target.value })} required style={{ padding: '0.6rem', borderRadius: 'var(--radius-sm)' }} />
                </div>

                <input type="number" placeholder="Units Owned" value={form.units} onChange={e => setForm({ ...form, units: e.target.value })} required style={{ padding: '0.6rem', borderRadius: 'var(--radius-sm)' }} />
                
                <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem', fontSize: '0.9rem', borderRadius: 'var(--radius-sm)' }}>
                  Save to Portfolio
                </button>
              </form>
            )}

            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: 1.4 }}>
              Add details of your mutual fund schemes or equity share holdings to evaluate capital gains timeline.
            </p>
          </div>
        </div>

        {/* ── Right Column: Harvesting plan & holdings list ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Action Recommendation */}
          <div className="glass-panel" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <TrendingDown color="var(--secondary)" size={24} />
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Estimated Immediate Tax Savings</p>
              <h2 style={{ color: 'var(--secondary)', fontSize: '2rem' }}>{FMT(taxSaved)} Saved</h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                By harvesting <strong>{FMT(potentialHarvest)}</strong> of LTCG before March 31.
              </p>
            </div>
          </div>

          {/* Action Harvesting Schedule */}
          {recommendations.length > 0 && (
            <div className="glass-panel">
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Recommended Harvesting Transactions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {recommendations.map((rec, idx) => (
                  <div key={idx} style={{ padding: '1rem', background: 'var(--bg-light-elem)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <strong style={{ fontSize: '0.95rem' }}>{rec.name}</strong>
                      <span style={{ fontWeight: 800, color: 'var(--secondary)' }}>Harvests: {FMT(rec.realizedGain)}</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Instructions: Sell <strong>{rec.unitsToSell} units</strong> (total value: {FMT(rec.valueToReinvest)}). Buy them back immediately to reset your purchase price to today's market price.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Holdings Grid */}
          <div className="glass-panel">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Equity Holdings Audit</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {calculatedHoldings.map(h => (
                <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-light-elem)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
                  <div>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>{h.name}</strong>
                    <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      <span>Cost: {FMT(h.totalCost)}</span>
                      <span>•</span>
                      <span>Value: {FMT(h.currentValue)}</span>
                      <span>•</span>
                      <span style={{ 
                        fontWeight: 700, 
                        color: h.isLtcg ? 'var(--secondary)' : '#f59e0b',
                        background: h.isLtcg ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                        padding: '0.05rem 0.4rem',
                        borderRadius: '4px'
                      }}>
                        {h.isLtcg ? `LTCG (${Math.round(h.diffDays / 30)}mo)` : `STCG (${Math.round(h.diffDays / 30)}mo)`}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Unrealized Gain</p>
                      <p style={{ fontWeight: 800, color: h.totalGain >= 0 ? 'var(--secondary)' : 'var(--accent)', fontSize: '0.95rem' }}>
                        {h.totalGain >= 0 ? '+' : ''}{FMT(h.totalGain)}
                      </p>
                    </div>
                    <button onClick={() => handleDelete(h.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Educational Explainers */}
          <div className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}><Info size={16} color="var(--primary)" /> Indian Equity Tax Harvesting Rules</h4>
            <ul style={{ paddingLeft: '1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.4rem', lineHeight: 1.5 }}>
              <li><strong>Zero Wash Sale Rule</strong>: Unlike the US, Indian tax law does not ban repurchasing the same stock or mutual fund immediately after selling to harvest capital gains.</li>
              <li><strong>LTCG Exemption</strong>: Long-term capital gains on listed equity mutual funds/shares (assets held &gt; 365 days) are completely tax-free up to ₹1,25,000 per financial year. Beyond ₹1.25L, gains are taxed at 10%.</li>
              <li><strong>STCG Caution</strong>: Short-term capital gains (held &lt;= 365 days) are taxed flatly at 20%. Harvesting STCG is not recommended as it triggers immediate tax liability without exemption benefits.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
