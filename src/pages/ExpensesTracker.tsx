import { useState, useEffect, useMemo } from 'react';
import { Receipt, Plus, Trash2, Calendar, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Expense {
  id: string;
  amount: number;
  category: 'Food' | 'Transit' | 'Rent' | 'Bills' | 'Shopping' | 'Others';
  description: string;
  date: string;
}

const CATEGORIES = ['Food', 'Transit', 'Rent', 'Bills', 'Shopping', 'Others'] as const;

const CATEGORY_COLORS: Record<Expense['category'], string> = {
  Food: '#10b981',      // Emerald
  Transit: '#3b82f6',   // Blue
  Rent: '#f97316',      // Orange
  Bills: '#8b5cf6',     // Purple
  Shopping: '#ec4899',  // Pink
  Others: '#64748b',    // Slate
};

const FMT = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export default function ExpensesTracker() {
  const { userKey } = useAuth();
  const EXP_KEY = userKey('expenses');
  const BUDGET_KEY = userKey('expense_budget');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [form, setForm] = useState({
    amount: '',
    category: CATEGORIES[0] as Expense['category'],
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [monthlyBudget, setMonthlyBudget] = useState<number>(50000);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(EXP_KEY);
    if (saved) {
      try {
        setExpenses(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
    const savedBudget = localStorage.getItem(BUDGET_KEY);
    if (savedBudget) {
      setMonthlyBudget(Number(savedBudget));
    }
  }, [EXP_KEY]);

  // Save to localStorage
  const saveExpenses = (newExpenses: Expense[]) => {
    setExpenses(newExpenses);
    localStorage.setItem(EXP_KEY, JSON.stringify(newExpenses));
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0 || !form.description.trim()) return;

    const newExpense: Expense = {
      id: Date.now().toString(),
      amount: Number(form.amount),
      category: form.category,
      description: form.description.trim(),
      date: form.date
    };

    const updated = [newExpense, ...expenses];
    saveExpenses(updated);

    setForm({
      amount: '',
      category: CATEGORIES[0],
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleDelete = (id: string) => {
    const updated = expenses.filter(e => e.id !== id);
    saveExpenses(updated);
  };

  const handleBudgetChange = (val: number) => {
    setMonthlyBudget(val);
    localStorage.setItem(BUDGET_KEY, val.toString());
  };

  // Calculations
  const totalSpent = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);
  
  const categoryTotals = useMemo(() => {
    const totals: Record<Expense['category'], number> = {
      Food: 0, Transit: 0, Rent: 0, Bills: 0, Shopping: 0, Others: 0
    };
    expenses.forEach(e => {
      if (totals[e.category] !== undefined) {
        totals[e.category] += e.amount;
      }
    });
    return totals;
  }, [expenses]);

  const budgetPct = Math.min((totalSpent / (monthlyBudget || 1)) * 100, 100);
  const isOverBudget = totalSpent > monthlyBudget;

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Receipt size={40} color="var(--primary)" />
          <span>Daily Expenses <span className="text-gradient">Tracker</span></span>
        </h1>
        <p style={{ marginTop: '0.5rem', fontSize: '1.1rem' }}>
          Log your daily expenses, monitor category limits, and visualize monthly spending habits.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* ── Left Column: Log Expense & Budget Control ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Budget Limit Panel */}
          <div className="glass-panel" style={{ borderLeft: `4px solid ${isOverBudget ? 'var(--accent)' : 'var(--secondary)'}` }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Monthly Budget Target</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <input
                type="number"
                value={monthlyBudget || ''}
                onChange={e => handleBudgetChange(Number(e.target.value))}
                placeholder="Set Budget e.g. 50000"
                style={{ padding: '0.65rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', background: 'var(--bg-light-elem)', color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 700 }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              <span>Total Spent: {FMT(totalSpent)}</span>
              <span>Budget: {FMT(monthlyBudget)}</span>
            </div>

            <div style={{ height: '8px', background: 'var(--bg-light-elem)', borderRadius: '99px', overflow: 'hidden', marginBottom: '0.75rem' }}>
              <div 
                style={{ 
                  height: '100%', 
                  width: `${budgetPct}%`, 
                  background: isOverBudget ? 'var(--accent)' : 'var(--secondary)', 
                  borderRadius: '99px', 
                  transition: 'width 0.5s ease' 
                }} 
              />
            </div>

            {isOverBudget && (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'rgba(244,63,94,0.1)', color: 'var(--accent)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', fontWeight: 600 }}>
                <AlertCircle size={16} />
                <span>Over budget by {FMT(totalSpent - monthlyBudget)}!</span>
              </div>
            )}
          </div>

          {/* Add Expense Form */}
          <div className="glass-panel">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Log New Expense</h3>
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Amount (₹)</label>
                <input
                  required
                  type="number"
                  placeholder="e.g. 450"
                  value={form.amount}
                  onChange={e => setForm({ ...form, amount: e.target.value })}
                  style={{ padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', background: 'var(--bg-light-elem)', color: 'var(--text-main)', fontSize: '0.95rem' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Category</label>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value as Expense['category'] })}
                  style={{ padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', background: 'var(--bg-light-elem)', color: 'var(--text-main)', fontSize: '0.95rem' }}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Description</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Groceries, Uber to Office"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  style={{ padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', background: 'var(--bg-light-elem)', color: 'var(--text-main)', fontSize: '0.95rem' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                  style={{ padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', background: 'var(--bg-light-elem)', color: 'var(--text-main)', fontSize: '0.95rem' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                <Plus size={18} /> Record Expense
              </button>
            </form>
          </div>
        </div>

        {/* ── Right Column: Category Analysis & Transaction Log ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Category Breakdown Progress Bars */}
          <div className="glass-panel">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Category Breakdown</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              {CATEGORIES.map(category => {
                const amount = categoryTotals[category];
                const pct = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
                const color = CATEGORY_COLORS[category];

                return (
                  <div key={category} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', padding: '1rem', background: 'var(--bg-light-elem)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: color, display: 'inline-block' }} />
                        {category}
                      </span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color }}>{FMT(amount)}</span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--bg-light)', borderRadius: '99px', overflow: 'hidden', marginTop: '0.25rem' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '99px' }} />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{pct.toFixed(0)}% of total outflows</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Transaction Log */}
          <div className="glass-panel">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Transactions Log ({expenses.length})</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '450px', overflowY: 'auto' }}>
              {expenses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  No expenses recorded yet. Use the form on the left to start tracking.
                </div>
              ) : (
                expenses.map(item => {
                  const color = CATEGORY_COLORS[item.category];
                  return (
                    <div 
                      key={item.id} 
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        padding: '0.75rem 1.25rem', 
                        background: 'var(--bg-light-elem)', 
                        borderRadius: 'var(--radius-sm)', 
                        border: '1px solid var(--glass-border)',
                        borderLeft: `4px solid ${color}`
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>{item.description}</span>
                        <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          <span style={{ color, fontWeight: 700 }}>{item.category}</span>
                          <span>•</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                            <Calendar size={12} /> {item.date}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)' }}>-{FMT(item.amount)}</span>
                        <button 
                          onClick={() => handleDelete(item.id)} 
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', padding: '0.25rem' }}
                          title="Delete transaction"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
