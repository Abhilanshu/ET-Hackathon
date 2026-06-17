import { useState, useEffect, useMemo } from 'react';
import { Coins, Plus, Trash2, LineChart, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface StockHolding {
  id: string;
  symbol: string;
  name: string;
  shares: number;
  buyPrice: number;
  currentPrice: number;
}

interface GoldHolding {
  grams: number;
  buyPricePerGram: number;
}

const FMT = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

export default function InvestmentsTracker() {
  const { userKey } = useAuth();
  const STOCKS_KEY = userKey('investments_stocks');
  const GOLD_KEY = userKey('investments_gold');

  const [stocks, setStocks] = useState<StockHolding[]>([]);
  const [gold, setGold] = useState<GoldHolding>({ grams: 0, buyPricePerGram: 0 });

  const [stockForm, setStockForm] = useState({
    symbol: '',
    name: '',
    shares: '',
    buyPrice: '',
    currentPrice: ''
  });

  const [goldForm, setGoldForm] = useState({
    grams: '',
    buyPricePerGram: ''
  });

  const [showStockForm, setShowStockForm] = useState(false);
  const [niftyIndex, setNiftyIndex] = useState(23450.75);
  const [niftyChange, setNiftyChange] = useState(1.25);
  const [goldMarketPrice, setGoldMarketPrice] = useState(7250); // ₹/gram

  // Load from LocalStorage
  useEffect(() => {
    const savedStocks = localStorage.getItem(STOCKS_KEY);
    if (savedStocks) {
      try { setStocks(JSON.parse(savedStocks)); } catch (e) { console.error(e); }
    }
    const savedGold = localStorage.getItem(GOLD_KEY);
    if (savedGold) {
      try { setGold(JSON.parse(savedGold)); } catch (e) { console.error(e); }
    }
  }, [STOCKS_KEY]);

  // Sync / Tick Prices
  useEffect(() => {
    const interval = setInterval(() => {
      // Small random ticks
      setNiftyIndex(prev => {
        const delta = (Math.random() - 0.48) * 15;
        const next = Math.max(10000, prev + delta);
        setNiftyChange((delta / prev) * 100);
        return next;
      });

      setGoldMarketPrice(prev => {
        const delta = (Math.random() - 0.5) * 5;
        return Math.max(5000, prev + delta);
      });

      // Tick stocks currentPrice randomly by a small fraction
      setStocks(prevStocks => 
        prevStocks.map(s => {
          const delta = (Math.random() - 0.49) * (s.currentPrice * 0.005);
          return { ...s, currentPrice: Math.round((s.currentPrice + delta) * 10) / 10 };
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const saveStocks = (updated: StockHolding[]) => {
    setStocks(updated);
    localStorage.setItem(STOCKS_KEY, JSON.stringify(updated));
  };

  const handleAddStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockForm.symbol || !stockForm.shares || !stockForm.buyPrice) return;

    const newStock: StockHolding = {
      id: Date.now().toString(),
      symbol: stockForm.symbol.toUpperCase().trim(),
      name: stockForm.name.trim() || stockForm.symbol.toUpperCase().trim(),
      shares: Number(stockForm.shares),
      buyPrice: Number(stockForm.buyPrice),
      currentPrice: Number(stockForm.currentPrice) || Number(stockForm.buyPrice)
    };

    const updated = [...stocks, newStock];
    saveStocks(updated);
    setStockForm({ symbol: '', name: '', shares: '', buyPrice: '', currentPrice: '' });
    setShowStockForm(false);
  };

  const handleDeleteStock = (id: string) => {
    const updated = stocks.filter(s => s.id !== id);
    saveStocks(updated);
  };

  const handleUpdateGold = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goldForm.grams || !goldForm.buyPricePerGram) return;

    const updated = {
      grams: Number(goldForm.grams),
      buyPricePerGram: Number(goldForm.buyPricePerGram)
    };
    setGold(updated);
    localStorage.setItem(GOLD_KEY, JSON.stringify(updated));
    setGoldForm({ grams: '', buyPricePerGram: '' });
  };

  // Calculations
  const stockCost = useMemo(() => stocks.reduce((s, x) => s + (x.buyPrice * x.shares), 0), [stocks]);
  const stockValuation = useMemo(() => stocks.reduce((s, x) => s + (x.currentPrice * x.shares), 0), [stocks]);

  const goldCost = gold.grams * gold.buyPricePerGram;
  const goldValuation = gold.grams * goldMarketPrice;
  const goldGain = goldValuation - goldCost;
  const goldGainPct = goldCost > 0 ? (goldGain / goldCost) * 100 : 0;

  const totalCost = stockCost + goldCost;
  const totalValuation = stockValuation + goldValuation;
  const totalGain = totalValuation - totalCost;
  const totalGainPct = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

  return (
    <div className="animate-fade-in-up">
      {/* Dynamic Marquee Market Ticker */}
      <div className="glass-panel" style={{ padding: '0.75rem 2rem', borderRadius: 'var(--radius-sm)', marginBottom: '2rem', display: 'flex', gap: '3rem', overflow: 'hidden', alignItems: 'center', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
          <span style={{ fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>MARKET TICKER</span>
          <span style={{ height: '12px', width: '1px', background: 'var(--glass-border)' }} />
        </div>

        <div style={{ display: 'flex', gap: '4rem', flex: 1, overflowX: 'auto', scrollbarWidth: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>NIFTY 50</span>
            <span style={{ fontWeight: 800, fontFamily: 'monospace' }}>{niftyIndex.toFixed(2)}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.1rem', fontSize: '0.8rem', fontWeight: 700, color: niftyChange >= 0 ? 'var(--secondary)' : 'var(--accent)' }}>
              {niftyChange >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {niftyChange >= 0 ? '+' : ''}{niftyChange.toFixed(2)}%
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>GOLD (24K/1g)</span>
            <span style={{ fontWeight: 800, fontFamily: 'monospace' }}>{FMT(goldMarketPrice)}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--secondary)' }}>
              <TrendingUp size={14} /> Live Price Feed
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
          <RefreshCw size={14} style={{ animation: 'spin 4s linear infinite' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Ticking live</span>
        </div>
      </div>

      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Coins size={40} color="var(--primary)" />
          <span>Stocks & Gold <span className="text-gradient">Portfolio</span></span>
        </h1>
        <p style={{ marginTop: '0.5rem', fontSize: '1.1rem' }}>
          Track equity holdings and physically/digitally backed Gold. Connects directly to the stress test and rebalancing engine.
        </p>
      </div>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Portfolio Value', val: FMT(totalValuation), desc: 'Real-time Net Asset Value' },
          { label: 'Total Cost Basis', val: FMT(totalCost), desc: 'Net invested capital' },
          { 
            label: 'Total Net Return', 
            val: totalGain >= 0 ? `+${FMT(totalGain)}` : `-${FMT(Math.abs(totalGain))}`, 
            desc: `${totalGainPct >= 0 ? '+' : ''}${totalGainPct.toFixed(2)}% returns`, 
            color: totalGain >= 0 ? 'var(--secondary)' : 'var(--accent)' 
          }
        ].map((c, i) => (
          <div key={i} className="glass-panel" style={{ padding: '1.5rem' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{c.label}</p>
            <h2 style={{ fontSize: '2rem', color: c.color }}>{c.val}</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>{c.desc}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* ── Left Side: Stocks Portfolio ── */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem' }}>
              <LineChart color="var(--primary)" size={20} />
              Stock Holdings
            </h3>
            <button className="btn btn-primary" onClick={() => setShowStockForm(v => !v)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
              <Plus size={14} /> Add Stock
            </button>
          </div>

          {showStockForm && (
            <form onSubmit={handleAddStock} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'var(--bg-light-elem)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ticker Symbol</label>
                <input required placeholder="e.g. INFY" value={stockForm.symbol} onChange={e => setStockForm({ ...stockForm, symbol: e.target.value })} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Company Name</label>
                <input placeholder="e.g. Infosys" value={stockForm.name} onChange={e => setStockForm({ ...stockForm, name: e.target.value })} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Shares Owned</label>
                <input required type="number" placeholder="e.g. 10" value={stockForm.shares} onChange={e => setStockForm({ ...stockForm, shares: e.target.value })} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Average Buy Price (₹)</label>
                <input required type="number" placeholder="e.g. 1450" value={stockForm.buyPrice} onChange={e => setStockForm({ ...stockForm, buyPrice: e.target.value })} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Current Price (₹) [Optional]</label>
                <input type="number" placeholder="Leave blank to match buy price" value={stockForm.currentPrice} onChange={e => setStockForm({ ...stockForm, currentPrice: e.target.value })} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ gridColumn: '1 / -1', padding: '0.6rem', borderRadius: 'var(--radius-sm)', marginTop: '0.5rem' }}>
                Confirm Stock Investment
              </button>
            </form>
          )}

          {/* Stocks List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {stocks.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', padding: '2rem' }}>No stocks tracked yet.</p>
            ) : (
              stocks.map(s => {
                const cost = s.buyPrice * s.shares;
                const value = s.currentPrice * s.shares;
                const gain = value - cost;
                return (
                  <div key={s.id} style={{ display: 'flex', flexDirection: 'column', padding: '1rem', background: 'var(--bg-light-elem)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>{s.symbol}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>({s.name})</span>
                      </div>
                      <button onClick={() => handleDeleteStock(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', textAlign: 'center' }}>
                      <div style={{ background: 'var(--bg-light)', padding: '0.4rem', borderRadius: 'var(--radius-sm)' }}>
                        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Shares · Avg Cost</p>
                        <p style={{ fontSize: '0.85rem', fontWeight: 700 }}>{s.shares} × {FMT(s.buyPrice)}</p>
                      </div>
                      <div style={{ background: 'var(--bg-light)', padding: '0.4rem', borderRadius: 'var(--radius-sm)' }}>
                        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Current Value</p>
                        <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>{FMT(value)}</p>
                      </div>
                      <div style={{ background: 'var(--bg-light)', padding: '0.4rem', borderRadius: 'var(--radius-sm)' }}>
                        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Net Return</p>
                        <p style={{ fontSize: '0.85rem', fontWeight: 700, color: gain >= 0 ? 'var(--secondary)' : 'var(--accent)' }}>
                          {gain >= 0 ? '+' : ''}{FMT(gain)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Right Side: Gold Tracker ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Gold Stats Panel */}
          <div className="glass-panel" style={{ borderLeft: '4px solid #eab308' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem' }}>
              <Coins color="#eab308" size={20} />
              Gold Holdings
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
              <div style={{ background: 'var(--bg-light-elem)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Total Gold Weight</p>
                <h2>{gold.grams} grams</h2>
              </div>
              <div style={{ background: 'var(--bg-light-elem)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Current Valuation</p>
                <h2 style={{ color: '#eab308' }}>{FMT(goldValuation)}</h2>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--glass-border)', fontSize: '0.9rem', marginTop: '1rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Invested Cost Basis</span>
              <span style={{ fontWeight: 700 }}>{FMT(goldCost)} (avg {FMT(gold.buyPricePerGram)}/g)</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--glass-border)', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Unrealized Gain</span>
              <span style={{ fontWeight: 700, color: goldGain >= 0 ? 'var(--secondary)' : 'var(--accent)' }}>
                {goldGain >= 0 ? '+' : ''}{FMT(goldGain)} ({goldGainPct.toFixed(1)}%)
              </span>
            </div>
          </div>

          {/* Update Gold Form */}
          <div className="glass-panel">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Update Gold Holdings</h3>
            <form onSubmit={handleUpdateGold} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Grams of Gold (g)</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    placeholder={`Current: ${gold.grams}g`}
                    value={goldForm.grams}
                    onChange={e => setGoldForm({ ...goldForm, grams: e.target.value })}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Avg Buy Rate (₹/g)</label>
                  <input
                    required
                    type="number"
                    placeholder={`Current: ${gold.buyPricePerGram}`}
                    value={goldForm.buyPricePerGram}
                    onChange={e => setGoldForm({ ...goldForm, buyPricePerGram: e.target.value })}
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)' }}>
                Update Gold Inventory
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
