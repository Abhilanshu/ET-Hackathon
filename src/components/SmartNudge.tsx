import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function SmartNudge() {
    const { portfolio } = useAuth();
    const [show, setShow] = useState(false);

    useEffect(() => {
        // Only show the SIP nudge if a real bank account is connected
        // and the user has actual SIP data — never on fresh signup
        if (!portfolio?.bankConnected || !portfolio?.sipAmount) return;

        const timer = setTimeout(() => {
            setShow(true);
        }, 8000);

        return () => clearTimeout(timer);
    }, [portfolio]);

    if (!show) return null;

    return (
        <div className="glass-panel animate-fade-in-up" style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', width: '300px', zIndex: 9999, borderLeft: '4px solid var(--accent)', padding: '1rem', boxShadow: '0 4px 30px rgba(0,0,0,0.5)', background: 'var(--bg-light)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', margin: 0, fontSize: '0.9rem' }}>
                    <Bell size={16} /> SIP Reminder
                </h4>
                <button onClick={() => setShow(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}><X size={16} /></button>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', margin: 0, lineHeight: 1.4 }}>
                Your ₹{portfolio.sipAmount.toLocaleString('en-IN')} monthly SIP is active via {portfolio.bankName}. Make sure your mandate is valid.
            </p>
        </div>
    );
}
