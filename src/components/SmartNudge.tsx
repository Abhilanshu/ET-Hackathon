import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';

export function SmartNudge() {
    const [show, setShow] = useState(false);
    const [nudge, setNudge] = useState({ title: '', message: '' });

    useEffect(() => {
        // Simulate a smart nudge timing (e.g., 5 seconds after mount)
        const timer = setTimeout(() => {
            setNudge({
                title: 'Missed SIP Alert',
                message: 'Your ₹15,000 monthly HDFC Index Fund SIP appears to have failed today. Please verify your bank mandate.'
            });
            setShow(true);
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    if (!show) return null;

    return (
        <div className="glass-panel animate-fade-in-up" style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', width: '300px', zIndex: 9999, borderLeft: '4px solid var(--accent)', padding: '1rem', boxShadow: '0 4px 30px rgba(0,0,0,0.5)', background: 'var(--bg-light)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', margin: 0, fontSize: '0.9rem' }}>
                    <Bell size={16} /> {nudge.title}
                </h4>
                <button onClick={() => setShow(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}><X size={16} /></button>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', margin: 0, lineHeight: 1.4 }}>{nudge.message}</p>
        </div>
    );
}
