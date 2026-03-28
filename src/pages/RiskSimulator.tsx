import { useState } from 'react';
import { Activity, ArrowDownRight, ShieldAlert, BarChart3, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RiskSimulator() {
    const { portfolio } = useAuth();
    const baseCorpus = portfolio?.totalCorpus || 2500000;

    const [scenario, setScenario] = useState<{ drop: number, inflation: number, active: boolean }>({
        drop: 20,
        inflation: 6,
        active: false
    });

    const simulateCrisis = (e: React.FormEvent) => {
        e.preventDefault();
        setScenario({ ...scenario, active: true });
    };

    const currentWorth = baseCorpus;
    const simulatedDrop = currentWorth * (scenario.drop / 100);
    const newWorth = currentWorth - simulatedDrop;

    // Real inflation impact (purchasing power loss over 5 years without growth)
    const purchasingPowerLoss = newWorth - (newWorth / Math.pow(1 + (scenario.inflation / 100), 5));

    return (
        <div className="animate-fade-in-up">
            <div style={{ marginBottom: '2rem' }}>
                <h1>Risk <span className="text-gradient-accent">Simulation Engine</span></h1>
                <p style={{ marginTop: '0.5rem', fontSize: '1.1rem' }}>Stress-test your portfolio against extreme market events & Indian macroeconomic shifts.</p>
            </div>

            <div className="dashboard-grid">
                <div className="glass-panel" style={{ gridColumn: '1 / -1' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <Activity color="var(--accent)" size={20} /> Configure Stress Test
                    </h3>

                    <form onSubmit={simulateCrisis} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', alignItems: 'flex-end' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Market Crash Severity (%)</label>
                            <input type="range" min="5" max="50" value={scenario.drop} onChange={(e) => setScenario({ ...scenario, drop: Number(e.target.value) })} style={{ width: '100%', marginBottom: '0.8rem' }} />
                            <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--accent)' }}>-{scenario.drop}% Drop</div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>India CPI Inflation Rate (%)</label>
                            <input type="range" min="4" max="12" value={scenario.inflation} onChange={(e) => setScenario({ ...scenario, inflation: Number(e.target.value) })} style={{ width: '100%', marginBottom: '0.8rem' }} />
                            <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--primary)' }}>{scenario.inflation}% Inflation</div>
                        </div>

                        <button type="submit" className="btn btn-outline" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>Run Simulation</button>
                    </form>
                </div>

                {scenario.active && (
                    <>
                        <div className="glass-panel animate-fade-in-up" style={{ borderLeft: '4px solid var(--accent)' }}>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Immediate Market Loss</p>
                            <h2 style={{ fontSize: '2.5rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <ArrowDownRight size={32} />
                                ₹{(simulatedDrop / 100000).toFixed(2)}L
                            </h2>
                            <p style={{ fontSize: '0.85rem', marginTop: '1rem' }}>Your ₹{(currentWorth / 100000).toFixed(2)}L corpus falls to <strong>₹{(newWorth / 100000).toFixed(2)}L</strong> theoretically overnight.</p>
                        </div>

                        <div className="glass-panel animate-fade-in-up" style={{ borderLeft: '4px solid #fbbf24' }}>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>5-Year Purchasing Power Destruction</p>
                            <h2 style={{ fontSize: '2.5rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <ArrowDownRight size={32} />
                                ₹{(purchasingPowerLoss / 100000).toFixed(2)}L
                            </h2>
                            <p style={{ fontSize: '0.85rem', marginTop: '1rem' }}>At {scenario.inflation}% inflation, your crashed portfolio actually buys <strong>₹{((newWorth - purchasingPowerLoss) / 100000).toFixed(2)}L</strong> worth of goods in 5 years.</p>
                        </div>

                        <div className="glass-panel animate-fade-in-up" style={{ gridColumn: '1 / -1', background: 'var(--bg-light-elem)' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                <ShieldAlert color="var(--primary)" size={20} /> MentorAI Protective Action Plan
                            </h3>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                                <div style={{ background: 'var(--bg-light)', padding: '1.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)' }}>
                                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--primary)' }}><Info size={16} /> Avoid Pre-mature Withdrawal</h4>
                                    <p style={{ fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--text-muted)' }}>Do not liquidate equity at a -{scenario.drop}% loss! Indian markets historically recover from such crashes within 14-24 months. Liquidating now locks the permanent unrecoverable loss into reality.</p>
                                </div>

                                <div style={{ background: 'var(--bg-light)', padding: '1.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)' }}>
                                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--primary)' }}><BarChart3 size={16} /> PPF & EPF Hedge</h4>
                                    <p style={{ fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--text-muted)' }}>As an Indian investor, your EPF (8.15%) and PPF (7.1%) are completely insulated from this {scenario.drop}% crash. Factor those into your true net-worth to realize the drop is actually much softer across your holistic asset allocation.</p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
