import { useState, useEffect } from 'react';
import { Target, Plus, X, Edit2, Trash2, Calendar, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type Goal = {
    _id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    monthlyContribution: number;
    deadline: string;
};

export default function Goals() {
    const { isAuthenticated } = useAuth();
    const [goals, setGoals] = useState<Goal[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [currentGoal, setCurrentGoal] = useState<Partial<Goal>>({
        name: '', targetAmount: 0, currentAmount: 0, monthlyContribution: 0, deadline: ''
    });

    const getOfflineGoals = (): Goal[] => {
        try {
            const saved = localStorage.getItem('mentorai_offline_goals');
            if (saved) return JSON.parse(saved);
        } catch (e) {
            console.error(e);
        }
        return [
            { _id: 'off_1', name: 'House Downpayment', targetAmount: 2500000, currentAmount: 650000, monthlyContribution: 25000, deadline: '2029-12-31' },
            { _id: 'off_2', name: 'Retirement Buffer', targetAmount: 50000000, currentAmount: 1200000, monthlyContribution: 35000, deadline: '2045-06-30' }
        ];
    };

    const fetchGoals = async () => {
        const token = localStorage.getItem('mentorai_token');
        if (!token) {
            setGoals(getOfflineGoals());
            return;
        }
        try {
            const res = await fetch('/api/goals', { headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) {
                const data = await res.json();
                setGoals(data);
                localStorage.setItem('mentorai_offline_goals', JSON.stringify(data));
            } else {
                setGoals(getOfflineGoals());
            }
        } catch (e) {
            console.error(e);
            setGoals(getOfflineGoals());
        }
    };

    useEffect(() => {
        fetchGoals();
    }, [isAuthenticated]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('mentorai_token');
        
        // Offline save logic
        const offlineGoals = getOfflineGoals();
        if (currentGoal._id) {
            // Edit
            const idx = offlineGoals.findIndex(g => g._id === currentGoal._id);
            if (idx !== -1) offlineGoals[idx] = currentGoal as Goal;
        } else {
            // Create
            const newG = { ...currentGoal, _id: `off_${Date.now()}` } as Goal;
            offlineGoals.push(newG);
        }
        localStorage.setItem('mentorai_offline_goals', JSON.stringify(offlineGoals));

        if (!token) {
            fetchGoals();
            setShowModal(false);
            setCurrentGoal({ name: '', targetAmount: 0, currentAmount: 0, monthlyContribution: 0, deadline: '' });
            return;
        }

        const method = currentGoal._id && !currentGoal._id.startsWith('off_') ? 'PUT' : 'POST';
        const url = currentGoal._id && !currentGoal._id.startsWith('off_') ? `/api/goals/${currentGoal._id}` : '/api/goals';

        try {
            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(currentGoal)
            });
            fetchGoals();
            setShowModal(false);
            setCurrentGoal({ name: '', targetAmount: 0, currentAmount: 0, monthlyContribution: 0, deadline: '' });
        } catch (err) {
            console.error(err);
            fetchGoals();
            setShowModal(false);
            setCurrentGoal({ name: '', targetAmount: 0, currentAmount: 0, monthlyContribution: 0, deadline: '' });
        }
    };

    const handleDelete = async (id: string) => {
        const offlineGoals = getOfflineGoals().filter(g => g._id !== id);
        localStorage.setItem('mentorai_offline_goals', JSON.stringify(offlineGoals));

        const token = localStorage.getItem('mentorai_token');
        if (!token || id.startsWith('off_')) {
            fetchGoals();
            return;
        }

        try {
            await fetch(`/api/goals/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            fetchGoals();
        } catch (e) {
            console.error(e);
            fetchGoals();
        }
    };

    return (
        <div className="animate-fade-in-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
                <div>
                    <h1>Financial <span className="text-gradient">Goals</span></h1>
                    <p style={{ marginTop: '0.5rem', fontSize: '1.1rem' }}>Track and manage your major financial milestones.</p>
                </div>
                <button className="btn btn-primary" onClick={() => {
                    setCurrentGoal({ name: '', targetAmount: 0, currentAmount: 0, monthlyContribution: 0, deadline: '' });
                    setShowModal(true);
                }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={18} /> New Goal
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
                {goals.map(goal => {
                    const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                    const requiredMonths = goal.monthlyContribution > 0 ? (goal.targetAmount - goal.currentAmount) / goal.monthlyContribution : 0;

                    return (
                        <div key={goal._id} className="glass-panel" style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => { setCurrentGoal(goal); setShowModal(true); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Edit2 size={16} /></button>
                                <button onClick={() => handleDelete(goal._id)} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer' }}><Trash2 size={16} /></button>
                            </div>

                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', paddingRight: '3rem' }}>
                                <Target color="var(--primary)" size={20} /> {goal.name}
                            </h3>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '1.5rem', fontWeight: 600 }}>₹{(goal.currentAmount / 100000).toFixed(2)}L</span>
                                <span style={{ color: 'var(--text-muted)' }}>Target: ₹{(goal.targetAmount / 100000).toFixed(2)}L</span>
                            </div>

                            <div style={{ height: '8px', background: 'var(--bg-light-elem)', borderRadius: '99px', marginBottom: '1.5rem', overflow: 'hidden' }}>
                                <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--secondary))', borderRadius: '99px' }} />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1, background: 'var(--bg-light-elem)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)' }}>
                                    <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}><TrendingUp size={12} style={{ display: 'inline', marginRight: '4px' }} /> Monthly SIP</span>
                                    <strong>₹{goal.monthlyContribution.toLocaleString()}</strong>
                                </div>
                                <div style={{ flex: 1, background: 'var(--bg-light-elem)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)' }}>
                                    <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}><Calendar size={12} style={{ display: 'inline', marginRight: '4px' }} /> Est. Completion</span>
                                    <strong>{requiredMonths > 0 ? `${Math.ceil(requiredMonths)} months` : 'N/A'}</strong>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Goal Optimizer Panel */}
            <div className="glass-panel" style={{ marginTop: '3rem', borderLeft: '4px solid var(--primary)' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    <TrendingUp color="var(--primary)" size={20} /> MentorAI Goal Optimizer & SIP Step-Up Calculator
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  Select a goal to simulate how stepping up your monthly SIP contributions cuts down your target years, and review asset advice.
                </p>

                {goals.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Create a goal above to run optimization analytics.</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                    {goals.map(g => {
                      const remaining = g.targetAmount - g.currentAmount;
                      if (remaining <= 0) return null;
                      
                      const currentMonthly = g.monthlyContribution || 1000;
                      const flatMonths = remaining / currentMonthly;
                      
                      let stepUpMonths = 0;
                      let accumulated = 0;
                      let activeSIP = currentMonthly;
                      const maxSimulatedMonths = 360;

                      while (accumulated < remaining && stepUpMonths < maxSimulatedMonths) {
                        stepUpMonths++;
                        accumulated += activeSIP;
                        if (stepUpMonths % 12 === 0) {
                          activeSIP *= 1.10; // 10% step-up each year
                        }
                      }

                      const flatYears = flatMonths / 12;
                      const stepUpYears = stepUpMonths / 12;
                      const yearsSaved = Math.max(0, flatYears - stepUpYears);

                      // Asset recommendations based on years to deadline
                      const deadlineDate = new Date(g.deadline);
                      const yearsToDeadline = Math.max(0.1, (deadlineDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 365.25));
                      
                      let assetAdvice = 'Aggressive Equity Index Funds (80% Equity / 20% Debt)';
                      if (yearsToDeadline < 3) {
                        assetAdvice = 'Preservation Core (100% Fixed Deposits & Liquid Funds)';
                      } else if (yearsToDeadline < 5) {
                        assetAdvice = 'Balanced Allocation (50% Equity Index / 50% Arbitrage & Debt Funds)';
                      }

                      return (
                        <div key={g._id} style={{ background: 'var(--bg-light-elem)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          <h4 style={{ fontSize: '1rem', fontWeight: 700, borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>{g.name}</h4>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                              <span>Deadline Horizon:</span>
                              <strong style={{ color: 'var(--text-main)' }}>{yearsToDeadline.toFixed(1)} years</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                              <span>10% Annual Step-up saves:</span>
                              <strong style={{ color: 'var(--secondary)' }}>{yearsSaved.toFixed(1)} years</strong>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginTop: '0.5rem' }}>
                              <span>Recommended Asset Allocation:</span>
                              <strong style={{ color: 'var(--primary)' }}>{assetAdvice}</strong>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
            </div>

            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', backgroundColor: 'var(--bg-light)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h2>{currentGoal._id ? 'Edit Goal' : 'Create New Goal'}</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Goal Name</label>
                                <input required type="text" value={currentGoal.name} onChange={e => setCurrentGoal({ ...currentGoal, name: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', background: 'var(--bg-light-elem)', color: 'var(--text-main)' }} placeholder="e.g. Home Downpayment" />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Target Amount (₹)</label>
                                    <input required type="number" value={currentGoal.targetAmount || ''} onChange={e => setCurrentGoal({ ...currentGoal, targetAmount: Number(e.target.value) })} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', background: 'var(--bg-light-elem)', color: 'var(--text-main)' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Current Saved (₹)</label>
                                    <input required type="number" value={currentGoal.currentAmount || ''} onChange={e => setCurrentGoal({ ...currentGoal, currentAmount: Number(e.target.value) })} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', background: 'var(--bg-light-elem)', color: 'var(--text-main)' }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Monthly SIP (₹)</label>
                                    <input required type="number" value={currentGoal.monthlyContribution || ''} onChange={e => setCurrentGoal({ ...currentGoal, monthlyContribution: Number(e.target.value) })} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', background: 'var(--bg-light-elem)', color: 'var(--text-main)' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Target Date</label>
                                    <input required type="date" value={currentGoal.deadline ? currentGoal.deadline.split('T')[0] : ''} onChange={e => setCurrentGoal({ ...currentGoal, deadline: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', background: 'var(--bg-light-elem)', color: 'var(--text-main)' }} />
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Save Goal</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
