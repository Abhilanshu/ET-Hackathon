import { useState, useMemo } from 'react';
import { TrendingDown, Plus, Trash2, AlertTriangle, CheckCircle, Eye, ArrowRight, Calendar } from 'lucide-react';

// ─── Inline logic (mirrors liquidityEngine.js) ───────────────────────────────
function projectCashflow(
  avgInflow: number,
  avgOutflow: number,
  cashOnHand: number,
  scheduled: ScheduledItem[],
  months: number
) {
  const projections = [];
  let runningBalance = cashOnHand;
  for (let m = 1; m <= months; m++) {
    let inflow = avgInflow;
    let outflow = avgOutflow;
    scheduled.filter(s => s.month === m).forEach(s => {
      if (s.type === 'inflow') inflow += s.amount;
      else outflow += s.amount;
    });
    const netCash = inflow - outflow;
    runningBalance += netCash;
    projections.push({ month: m, inflow: Math.round(inflow), outflow: Math.round(outflow), netCash: Math.round(netCash), balance: Math.round(runningBalance) });
  }
  return projections;
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface ScheduledItem {
  id: string;
  label: string;
  amount: number;
  month: 1 | 2 | 3;
  type: 'inflow' | 'outflow';
}

const MONTH_LABELS = ['', 'Month 1', 'Month 2', 'Month 3'];
const FMT = (n: number) => `₹${Math.abs(n).toLocaleString('en-IN')}`;

export default function CashflowPredictor() {
  const [avgInflow, setAvgInflow] = useState(300000);
  const [avgOutflow, setAvgOutflow] = useState(220000);
  const [cashOnHand, setCashOnHand] = useState(150000);
  const [scheduled, setScheduled] = useState<ScheduledItem[]>([
    { id: '1', label: 'GST Payment', amount: 45000, month: 2, type: 'outflow' },
    { id: '2', label: 'Client Invoice', amount: 80000, month: 1, type: 'inflow' },
  ]);

  const [newItem, setNewItem] = useState<Omit<ScheduledItem, 'id'>>({
    label: '', amount: 0, month: 1, type: 'outflow',
  });
  const [showForm, setShowForm] = useState(false);

  const projections = useMemo(
    () => projectCashflow(avgInflow, avgOutflow, cashOnHand, scheduled, 3),
    [avgInflow, avgOutflow, cashOnHand, scheduled]
  );

  const maxAbs = Math.max(...projections.map(p => Math.max(Math.abs(p.inflow), Math.abs(p.outflow), Math.abs(p.balance))));
  const runway = avgOutflow > 0 ? (cashOnHand / avgOutflow) : Infinity;

  const alerts = projections
    .filter(p => p.balance < 0 || p.netCash < 0)
    .map(p => ({
      month: p.month,
      severity: p.balance < 0 ? 'critical' : 'warning',
      msg: p.balance < 0
        ? `Projected deficit of ${FMT(p.balance)} in Month ${p.month} — immediate action needed!`
        : `Cash burn exceeds inflows in Month ${p.month}. Balance drops to ${FMT(p.balance)}.`,
    }));

  const addItem = () => {
    if (!newItem.label || newItem.amount <= 0) return;
    setScheduled(prev => [...prev, { ...newItem, id: Date.now().toString() }]);
    setNewItem({ label: '', amount: 0, month: 1, type: 'outflow' });
    setShowForm(false);
  };

  const barColor = (p: typeof projections[0]) => {
    if (p.balance < 0) return 'var(--accent)';
    if (p.netCash < 0) return '#f59e0b';
    return 'var(--secondary)';
  };

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <TrendingDown size={40} color="var(--primary)" />
          <span>Cash Flow <span className="text-gradient">Predictor</span></span>
        </h1>
        <p style={{ marginTop: '0.5rem', fontSize: '1.1rem' }}>
          Project your 90-day liquidity runway and get alerts before cash crunches hit.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '2rem', alignItems: 'start' }}>

        {/* ── Left: Inputs ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Baseline Inputs */}
          <div className="glass-panel">
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Monthly Baseline</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {[
                { label: 'Avg Monthly Income / Revenue (₹)', val: avgInflow, set: setAvgInflow },
                { label: 'Avg Monthly Expenses / Burn (₹)', val: avgOutflow, set: setAvgOutflow },
                { label: 'Cash On Hand Today (₹)', val: cashOnHand, set: setCashOnHand },
              ].map(({ label, val, set }) => (
                <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{label}</label>
                  <input
                    type="number"
                    value={val}
                    onChange={e => set(Number(e.target.value))}
                    style={{ padding: '0.7rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', background: 'var(--bg-light-elem)', color: 'var(--text-main)', fontSize: '1rem' }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[
              { label: 'Cash Runway', value: runway === Infinity ? '∞' : runway < 1 ? `${Math.round(runway * 30)}d` : `${runway.toFixed(1)}mo`, color: runway < 2 ? 'var(--accent)' : runway < 4 ? '#f59e0b' : 'var(--secondary)' },
              { label: 'Avg Monthly Net', value: FMT(avgInflow - avgOutflow), color: avgInflow >= avgOutflow ? 'var(--secondary)' : 'var(--accent)' },
            ].map(k => (
              <div key={k.label} className="glass-panel" style={{ padding: '1.25rem', textAlign: 'center' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{k.label}</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 800, color: k.color }}>{k.value}</p>
              </div>
            ))}
          </div>

          {/* Scheduled Items */}
          <div className="glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem' }}>Scheduled Items</h3>
              <button onClick={() => setShowForm(v => !v)} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
                <Plus size={14} /> Add
              </button>
            </div>

            {showForm && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem', padding: '1rem', background: 'var(--bg-light-elem)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)' }}>
                <input placeholder="Label (e.g. Tax Payment)" value={newItem.label} onChange={e => setNewItem(p => ({ ...p, label: e.target.value }))} style={{ padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', background: 'var(--bg-light)', color: 'var(--text-main)', fontSize: '0.9rem' }} />
                <input type="number" placeholder="Amount (₹)" value={newItem.amount || ''} onChange={e => setNewItem(p => ({ ...p, amount: Number(e.target.value) }))} style={{ padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', background: 'var(--bg-light)', color: 'var(--text-main)', fontSize: '0.9rem' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <select value={newItem.month} onChange={e => setNewItem(p => ({ ...p, month: Number(e.target.value) as 1 | 2 | 3 }))} style={{ padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', background: 'var(--bg-light)', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                    <option value={1}>Month 1</option>
                    <option value={2}>Month 2</option>
                    <option value={3}>Month 3</option>
                  </select>
                  <select value={newItem.type} onChange={e => setNewItem(p => ({ ...p, type: e.target.value as 'inflow' | 'outflow' }))} style={{ padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', background: 'var(--bg-light)', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                    <option value="outflow">Outflow</option>
                    <option value="inflow">Inflow</option>
                  </select>
                </div>
                <button onClick={addItem} className="btn btn-primary" style={{ padding: '0.6rem', fontSize: '0.9rem', borderRadius: 'var(--radius-sm)' }}>
                  <ArrowRight size={14} /> Confirm
                </button>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {scheduled.length === 0 && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>No scheduled items yet.</p>}
              {scheduled.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'var(--bg-light-elem)', borderRadius: 'var(--radius-sm)', border: `1px solid ${item.type === 'inflow' ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)'}` }}>
                  <div>
                    <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>{item.label}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{MONTH_LABELS[item.month]} · {item.type}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontWeight: 700, color: item.type === 'inflow' ? 'var(--secondary)' : 'var(--accent)', fontSize: '0.95rem' }}>
                      {item.type === 'inflow' ? '+' : '-'}{FMT(item.amount)}
                    </span>
                    <button onClick={() => setScheduled(prev => prev.filter(s => s.id !== item.id))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.25rem' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: Chart + Alerts ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Alerts */}
          {alerts.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {alerts.map(a => (
                <div key={a.month} style={{
                  display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                  padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)',
                  border: `1px solid ${a.severity === 'critical' ? 'rgba(244,63,94,0.4)' : 'rgba(245,158,11,0.4)'}`,
                  background: a.severity === 'critical' ? 'rgba(244,63,94,0.08)' : 'rgba(245,158,11,0.08)',
                }}>
                  <AlertTriangle size={20} color={a.severity === 'critical' ? 'var(--accent)' : '#f59e0b'} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.5 }}>{a.msg}</p>
                </div>
              ))}
            </div>
          )}
          {alerts.length === 0 && (
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.07)' }}>
              <CheckCircle size={20} color="var(--secondary)" />
              <p style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>All clear! Your 90-day cash flow looks healthy with no projected deficits.</p>
            </div>
          )}

          {/* 90-Day Chart */}
          <div className="glass-panel">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', fontSize: '1.1rem' }}>
              <Eye size={18} color="var(--primary)" /> 90-Day Cash Flow Projection
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
              {projections.map(p => {
                const inflowPct = maxAbs > 0 ? (p.inflow / maxAbs) * 100 : 0;
                const outflowPct = maxAbs > 0 ? (p.outflow / maxAbs) * 100 : 0;
                const balPct = maxAbs > 0 ? (Math.abs(p.balance) / maxAbs) * 100 : 0;
                const color = barColor(p);

                return (
                  <div key={p.month} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <Calendar size={14} color="var(--text-muted)" />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>{MONTH_LABELS[p.month]}</span>
                    </div>

                    {/* Inflow bar */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                        <span>Inflow</span><span style={{ color: 'var(--secondary)', fontWeight: 600 }}>{FMT(p.inflow)}</span>
                      </div>
                      <div style={{ height: '8px', background: 'var(--bg-light-elem)', borderRadius: '99px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${inflowPct}%`, background: 'var(--secondary)', borderRadius: '99px', transition: 'width 0.6s ease' }} />
                      </div>
                    </div>

                    {/* Outflow bar */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                        <span>Outflow</span><span style={{ color: 'var(--accent)', fontWeight: 600 }}>{FMT(p.outflow)}</span>
                      </div>
                      <div style={{ height: '8px', background: 'var(--bg-light-elem)', borderRadius: '99px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${outflowPct}%`, background: 'var(--accent)', borderRadius: '99px', transition: 'width 0.6s ease' }} />
                      </div>
                    </div>

                    {/* Running balance */}
                    <div style={{ padding: '0.75rem', background: `${color}18`, border: `1px solid ${color}40`, borderRadius: 'var(--radius-sm)', textAlign: 'center', marginTop: '0.25rem' }}>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Running Balance</p>
                      <p style={{ fontSize: '1.1rem', fontWeight: 800, color }}>{p.balance < 0 ? '-' : ''}{FMT(p.balance)}</p>
                      <div style={{ height: '4px', background: 'var(--bg-light-elem)', borderRadius: '99px', overflow: 'hidden', marginTop: '0.5rem' }}>
                        <div style={{ height: '100%', width: `${Math.min(balPct, 100)}%`, background: color, borderRadius: '99px', transition: 'width 0.6s ease' }} />
                      </div>
                    </div>

                    {/* Net badge */}
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color, background: `${color}18`, padding: '0.2rem 0.75rem', borderRadius: '99px', border: `1px solid ${color}30` }}>
                        Net {p.netCash >= 0 ? '+' : ''}{FMT(p.netCash)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)', flexWrap: 'wrap' }}>
              {[['var(--secondary)', 'Surplus / Healthy'], ['#f59e0b', 'Cash Burn Warning'], ['var(--accent)', 'Deficit — Action Needed']].map(([c, l]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: c }} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Scheduled breakdown table */}
          {scheduled.length > 0 && (
            <div className="glass-panel">
              <h3 style={{ marginBottom: '1.25rem', fontSize: '1.1rem' }}>Scheduled Impact Breakdown</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[1, 2, 3].map(m => {
                  const items = scheduled.filter(s => s.month === m);
                  if (!items.length) return null;
                  return (
                    <div key={m}>
                      <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{MONTH_LABELS[m]}</p>
                      {items.map(item => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', fontSize: '0.9rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-light-elem)', marginBottom: '0.25rem' }}>
                          <span style={{ color: 'var(--text-main)' }}>{item.label}</span>
                          <span style={{ fontWeight: 700, color: item.type === 'inflow' ? 'var(--secondary)' : 'var(--accent)' }}>
                            {item.type === 'inflow' ? '+' : '-'}{FMT(item.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
