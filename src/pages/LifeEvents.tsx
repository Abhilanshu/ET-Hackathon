import { useState } from 'react';
import { ShieldAlert, ArrowRight, Briefcase, Heart, Baby, Home } from 'lucide-react';

const events = [
  { id: 'bonus', icon: Briefcase, title: 'Received a Bonus', desc: 'Got an unexpected lump sum? Let\'s allocate it smartly to avoid lifestyle creep.' },
  { id: 'marriage', icon: Heart, title: 'Getting Married', desc: 'Combine finances, claim joint benefits, and plan for shared goals.' },
  { id: 'baby', icon: Baby, title: 'New Baby', desc: 'Update nominations, plan for education costs, and boost health covers.' },
  { id: 'home', icon: Home, title: 'Buying a Home', desc: 'Assess EMI affordability, down payment strategies, and tax benefits.' }
];

export default function LifeEvents() {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  if (selectedEvent === 'bonus') {
    return (
      <div className="animate-fade-in-up">
        <button onClick={() => setSelectedEvent(null)} className="btn btn-outline" style={{ marginBottom: '2rem' }}>
          &larr; Back to Events
        </button>

        <div className="glass-panel stagger-1">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div className="logo-icon" style={{ background: 'var(--secondary)' }}><Briefcase size={20} /></div>
            <h2>Handling a Bonus</h2>
          </div>

          <div style={{ padding: '1.5rem', background: 'var(--bg-light-elem)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', borderLeft: '4px solid var(--secondary)' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>MentorAI's 50/30/20 Rule for Windfalls</h4>
            <p>Don't let lifestyle inflation consume your hard-earned bonus. Let's redirect this temporary cash flow into permanent wealth.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '2rem' }}>
            <div style={{ padding: '1.5rem', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-sm)' }}>
              <h3 className="text-gradient">50% Investment</h3>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Deploy into upcoming SIPs or park in a broad-market index fund immediately.</p>
            </div>
            <div style={{ padding: '1.5rem', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-sm)' }}>
              <h3 className="text-gradient-primary">30% Debt/Needs</h3>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Prepay any high-interest debt (e.g., credit cards) entirely. Prepay home loans if rates {'>'} 8.5%.</p>
            </div>
            <div style={{ padding: '1.5rem', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-sm)' }}>
              <h3 style={{ color: 'var(--text-main)' }}>20% Guilt-Free</h3>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>You earned it. Use this for a vacation, gadget, or discretionary spending unconditionally.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedEvent === 'marriage') {
    return (
      <div className="animate-fade-in-up">
        <button onClick={() => setSelectedEvent(null)} className="btn btn-outline" style={{ marginBottom: '2rem' }}>
          &larr; Back to Events
        </button>

        <div className="glass-panel stagger-1">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div className="logo-icon" style={{ background: 'var(--secondary)' }}><Heart size={20} /></div>
            <h2>Getting Married</h2>
          </div>

          <div style={{ padding: '1.5rem', background: 'var(--bg-light-elem)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', borderLeft: '4px solid var(--secondary)' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>MentorAI's Joint Planning Strategy</h4>
            <p>Transparency is the foundation. Start by declaring all individual debts and consolidating high-interest loans.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '2rem' }}>
            <div style={{ padding: '1.5rem', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-sm)' }}>
              <h3 className="text-gradient">Health Cover</h3>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Port individual corporate policies to a generous ₹15L Family Floater plan.</p>
            </div>
            <div style={{ padding: '1.5rem', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-sm)' }}>
              <h3 className="text-gradient-primary">Tax Benefits</h3>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Put HRA and joint loan structures under the partner in the higher tax bracket.</p>
            </div>
            <div style={{ padding: '1.5rem', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-sm)' }}>
              <h3 style={{ color: 'var(--text-main)' }}>Joint Account</h3>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Open a 'Yours, Mine, and Ours' structure. Fund 'Ours' proportionally.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedEvent === 'baby') {
    return (
      <div className="animate-fade-in-up">
        <button onClick={() => setSelectedEvent(null)} className="btn btn-outline" style={{ marginBottom: '2rem' }}>
          &larr; Back to Events
        </button>

        <div className="glass-panel stagger-1">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div className="logo-icon" style={{ background: 'var(--secondary)' }}><Baby size={20} /></div>
            <h2>New Baby</h2>
          </div>

          <div style={{ padding: '1.5rem', background: 'var(--bg-light-elem)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', borderLeft: '4px solid var(--secondary)' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Securing the Next Generation</h4>
            <p>A new dependent means your liability profile has drastically changed. Time to build a fortress.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '2rem' }}>
            <div style={{ padding: '1.5rem', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-sm)' }}>
              <h3 className="text-gradient">Life Insurance</h3>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Increase term covers by at least ₹1Cr to account for future education costs.</p>
            </div>
            <div style={{ padding: '1.5rem', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-sm)' }}>
              <h3 className="text-gradient-primary">Education Fund</h3>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Start a dedicated SIP in a flexi-cap fund. Let compounding do the heavy lifting for 18 years.</p>
            </div>
            <div style={{ padding: '1.5rem', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-sm)' }}>
              <h3 style={{ color: 'var(--text-main)' }}>Nominations</h3>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Update beneficiaries across all bank accounts, mutual funds, and EPF immediately.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedEvent === 'home') {
    return (
      <div className="animate-fade-in-up">
        <button onClick={() => setSelectedEvent(null)} className="btn btn-outline" style={{ marginBottom: '2rem' }}>
          &larr; Back to Events
        </button>

        <div className="glass-panel stagger-1">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div className="logo-icon" style={{ background: 'var(--secondary)' }}><Home size={20} /></div>
            <h2>Buying a Home</h2>
          </div>

          <div style={{ padding: '1.5rem', background: 'var(--bg-light-elem)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', borderLeft: '4px solid var(--secondary)' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>MentorAI's Real Estate Rules</h4>
            <p>A house is an emotional asset, not just a financial one. Ensure the EMI doesn't suffocate your future SIPs.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '2rem' }}>
            <div style={{ padding: '1.5rem', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-sm)' }}>
              <h3 className="text-gradient">EMI Cap</h3>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Keep your home loan EMI strictly below 30% of your in-hand monthly household income.</p>
            </div>
            <div style={{ padding: '1.5rem', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-sm)' }}>
              <h3 className="text-gradient-primary">Down Payment</h3>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Aim for a 20% down payment without liquidating your emergency fund or core retirement stocks.</p>
            </div>
            <div style={{ padding: '1.5rem', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-sm)' }}>
              <h3 style={{ color: 'var(--text-main)' }}>Section 24(b)</h3>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Claim up to ₹2L deduction on home loan interest. If co-borrowing, you both can claim up to ₹2L.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <ShieldAlert size={36} className="text-gradient-primary" />
            <span className="text-gradient">Life Event Advisor</span>
          </h1>
          <p style={{ marginTop: '0.5rem', fontSize: '1.1rem' }}>Select a major life transition, and MentorAI will give you a strategic playbook.</p>
        </div>
      </div>

      <div className="dashboard-grid">
        {events.map((ev, i) => {
          const Icon = ev.icon;
          return (
            <div
              key={ev.id}
              className={`glass-panel stagger-${i + 1}`}
              style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '1rem' }}
              onClick={() => setSelectedEvent(ev.id)}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-light-elem)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon className="text-gradient-primary" size={24} color="var(--primary)" />
              </div>
              <h3>{ev.title}</h3>
              <p style={{ fontSize: '0.95rem' }}>{ev.desc}</p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 'auto', color: 'var(--primary)', fontWeight: '600', fontSize: '0.9rem' }}>
                View Action Plan <ArrowRight size={16} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
