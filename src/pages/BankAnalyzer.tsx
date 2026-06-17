import { useState, useEffect, useMemo } from 'react';
import { Building, ShieldCheck, ArrowRight, Loader2, Sparkles, RefreshCw, AlertTriangle, Eye, HelpCircle, CheckCircle, Info } from 'lucide-react';

interface BankTransaction {
  id: string;
  raw: string;
  clean: string;
  category: string;
  amount: number;
  date: string;
  logo: string;
  isSubscription: boolean;
}

const MOCK_TRANSACTIONS: BankTransaction[] = [
  {
    id: '1',
    raw: 'UPI/9482938/NETFLIX-MEMBER/ICICI/recurring',
    clean: 'Netflix India',
    category: 'Entertainment',
    amount: 649,
    date: '2026-06-15',
    logo: '🍿',
    isSubscription: true
  },
  {
    id: '2',
    raw: 'UPI/8394820/AMZN-PRIME-MEMBERSHIP/HDFC',
    clean: 'Amazon Prime',
    category: 'Entertainment',
    amount: 299,
    date: '2026-06-12',
    logo: '📦',
    isSubscription: true
  },
  {
    id: '3',
    raw: 'POS/DEBIT/ZOMATO-ONLINE-DELIV/MUMBAI',
    clean: 'Zomato Food Delivery',
    category: 'Food',
    amount: 450,
    date: '2026-06-11',
    logo: '🍔',
    isSubscription: false
  },
  {
    id: '4',
    raw: 'UPI/7294820/SPOTIFY-IND-MUSIC/SPOTIFY',
    clean: 'Spotify Premium',
    category: 'Entertainment',
    amount: 119,
    date: '2026-06-08',
    logo: '🎵',
    isSubscription: true
  },
  {
    id: '5',
    raw: 'UPI/1209384/HOTSTAR-DISNEY-MEM/PAYTM',
    clean: 'Disney+ Hotstar',
    category: 'Entertainment',
    amount: 299,
    date: '2026-06-05',
    logo: '🏰',
    isSubscription: true
  },
  {
    id: '6',
    raw: 'POS/DEBIT/UBER-TRIPS-INDIA/BANGALORE',
    clean: 'Uber Cab Services',
    category: 'Transit',
    amount: 320,
    date: '2026-06-04',
    logo: '🚗',
    isSubscription: false
  },
  {
    id: '7',
    raw: 'UPI/4820384/GOOGLE-STORAGE-ONE/GOOGLE',
    clean: 'Google One Cloud Storage',
    category: 'Utility',
    amount: 130,
    date: '2026-06-01',
    logo: '☁️',
    isSubscription: true
  },
  {
    id: '8',
    raw: 'UPI/3820492/DROPBOX-INC-STORAGE/CARD',
    clean: 'Dropbox Cloud Storage',
    category: 'Utility',
    amount: 890,
    date: '2026-05-28',
    logo: '🗂️',
    isSubscription: true
  }
];

const FMT = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export default function BankAnalyzer() {
  // Connection states: 'disconnected' | 'otp_sent' | 'linking' | 'connected'
  const [connState, setConnState] = useState<'disconnected' | 'otp_sent' | 'linking' | 'connected'>('disconnected');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(30);
  const [consentApproved, setConsentApproved] = useState(false);
  
  // Dashboard states
  const [showRaw, setShowRaw] = useState(false);
  const [idleCash, setIdleCash] = useState<number>(150000);
  const [linkingProgress, setLinkingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing secure Account Aggregator gateway...');

  // Timer for simulated OTP
  useEffect(() => {
    let interval: any;
    if (connState === 'otp_sent' && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [connState, otpTimer]);

  // Loading animation progress
  useEffect(() => {
    let t: any;
    if (connState === 'linking') {
      const texts = [
        'Connecting to Account Aggregator API endpoint...',
        'Retrieving past 12 months encrypted transaction records...',
        'Parsing UPI merchant raw strings with AI regex database...',
        'Identifying recurring bill schedules and subscription costs...',
        'Success! Syncing final audit dashboard.'
      ];
      
      t = setInterval(() => {
        setLinkingProgress(prev => {
          const next = prev + 5;
          const textIndex = Math.min(Math.floor(next / 20), texts.length - 1);
          setLoadingText(texts[textIndex]);
          
          if (next >= 100) {
            clearInterval(t);
            setConnState('connected');
            localStorage.setItem('mentorai_bank_connected', 'true');
            localStorage.setItem('mentorai_bank_name', selectedBank);
            return 100;
          }
          return next;
        });
      }, 150);
    }
    return () => clearInterval(t);
  }, [connState, selectedBank]);

  // Pre-load connection state
  useEffect(() => {
    const isConn = localStorage.getItem('mentorai_bank_connected');
    const bName = localStorage.getItem('mentorai_bank_name');
    if (isConn === 'true') {
      setConnState('connected');
      if (bName) setSelectedBank(bName);
    }
  }, []);

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) return;
    setConnState('otp_sent');
    setOtpTimer(30);
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp === '123456' || otp.length === 6) {
      setConnState('linking');
      setLinkingProgress(0);
    } else {
      alert('Invalid OTP. Use mock code 123456 to bypass.');
    }
  };

  const handleDisconnect = () => {
    if (window.confirm('Are you sure you want to revoke consent? This will wipe all cached transaction records immediately.')) {
      setConnState('disconnected');
      setPhone('');
      setOtp('');
      setConsentApproved(false);
      localStorage.removeItem('mentorai_bank_connected');
      localStorage.removeItem('mentorai_bank_name');
    }
  };

  // Subscription Leak analysis calculations
  const totalSubSpend = useMemo(() => {
    return MOCK_TRANSACTIONS
      .filter(t => t.isSubscription)
      .reduce((s, t) => s + t.amount, 0);
  }, []);

  // Compute duplicates / optimization recommendations
  const subLeaks = useMemo(() => {
    const leaks = [];
    
    // Cloud storage overlap check
    const googleOne = MOCK_TRANSACTIONS.find(t => t.clean.includes('Google One'));
    const dropbox = MOCK_TRANSACTIONS.find(t => t.clean.includes('Dropbox'));
    if (googleOne && dropbox) {
      leaks.push({
        title: 'Overlapping Cloud Storage Services',
        desc: `You are paying for Dropbox (${FMT(dropbox.amount)}/mo) and Google One (${FMT(googleOne.amount)}/mo).`,
        saving: dropbox.amount,
        action: 'Consolidate to a single cloud provider. Google One offers up to 2TB for sharing; canceling Dropbox saves you money.'
      });
    }

    // Video Streaming overload check
    const netflix = MOCK_TRANSACTIONS.find(t => t.clean.includes('Netflix'));
    const prime = MOCK_TRANSACTIONS.find(t => t.clean.includes('Prime'));
    const hotstar = MOCK_TRANSACTIONS.find(t => t.clean.includes('Hotstar'));
    if (netflix && prime && hotstar) {
      leaks.push({
        title: 'Streaming Fatigue Alert',
        desc: `You are subscribed to Netflix, Prime Video, and Disney+ Hotstar simultaneously, spending ${FMT(netflix.amount + prime.amount + hotstar.amount)}/mo.`,
        saving: hotstar.amount,
        action: 'Activate cyclic subscriptions. Subscribe to Netflix for 2 months, watch its library, cancel, and cycle to Hotstar to prevent paying for idle services.'
      });
    }

    return leaks;
  }, []);

  const totalAnnualSavings = useMemo(() => {
    const monthlySavings = subLeaks.reduce((s, x) => s + x.saving, 0);
    return monthlySavings * 12;
  }, [subLeaks]);

  // Sweep calculations
  const sweepSummary = useMemo(() => {
    const savingsYield = 0.035; // 3.5%
    const liquidYield = 0.065; // 6.5% Liquid fund
    const arbitrageYield = 0.068; // 6.8% Arbitrage fund (taxed as equity!)
    
    const standardReturn = idleCash * savingsYield;
    const liquidReturn = idleCash * liquidYield;
    const arbitrageReturn = idleCash * arbitrageYield;

    return {
      standardReturn,
      liquidReturn,
      arbitrageReturn,
      liquidExtra: liquidReturn - standardReturn,
      arbitrageExtra: arbitrageReturn - standardReturn
    };
  }, [idleCash]);

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Building size={40} color="var(--primary)" />
          <span>Bank Account <span className="text-gradient">Intelligence</span></span>
        </h1>
        <p style={{ marginTop: '0.5rem', fontSize: '1.1rem' }}>
          Link your bank account securely using Account Aggregator consent flow to auto-parse transactions, isolate billing leaks, and sweep idle cash.
        </p>
      </div>

      {/* ── Visual State 1: Disconnected (Consent Gateway Form) ── */}
      {connState === 'disconnected' && (
        <div style={{ maxWidth: '640px', margin: '0 auto' }} className="glass-panel">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <ShieldCheck color="var(--primary)" size={28} />
            </div>
            <h2>Account Aggregator Consent Portal</h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              We partner with licensed Account Aggregators (RBI regulated) to link bank accounts securely without storing login passwords.
            </p>
          </div>

          <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Choose Your Financial Institution</label>
                <select value={selectedBank} onChange={e => setSelectedBank(e.target.value)}>
                  <option value="HDFC Bank">HDFC Bank Ltd</option>
                  <option value="ICICI Bank">ICICI Bank Ltd</option>
                  <option value="SBI">State Bank of India</option>
                  <option value="Axis Bank">Axis Bank Ltd</option>
                  <option value="Kotak Bank">Kotak Mahindra Bank</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Linked Mobile Number</label>
                <input 
                  required
                  type="tel" 
                  placeholder="e.g. 9876543210" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                  maxLength={10}
                />
              </div>
            </div>

            <div style={{ padding: '1.25rem', background: 'var(--bg-light-elem)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
              <h4 style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                <Info size={16} color="var(--primary)" /> Consent & Share Terms
              </h4>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <li><strong>Scope:</strong> Read-only access to deposit balances, monthly transactions, and recurring debits.</li>
                <li><strong>Duration:</strong> Active for exactly 1 year (expires automatically).</li>
                <li><strong>Revocability:</strong> You can terminate this consent and wipe data instantly from your dashboard.</li>
                <li><strong>No Passwords:</strong> We do NOT ask for net-banking passwords, PINs, or raw login credentials.</li>
              </ul>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', cursor: 'pointer', fontSize: '0.82rem' }}>
                <input 
                  type="checkbox" 
                  checked={consentApproved} 
                  onChange={e => setConsentApproved(e.target.checked)} 
                  style={{ cursor: 'pointer' }}
                />
                <span>I approve the consent parameters and authorize Account Aggregator link request.</span>
              </label>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={!consentApproved || phone.length < 10}
              style={{ width: '100%', padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
            >
              Request Consent Connection <ArrowRight size={18} />
            </button>
          </form>
        </div>
      )}

      {/* ── Visual State 2: OTP Entry ── */}
      {connState === 'otp_sent' && (
        <div style={{ maxWidth: '480px', margin: '0 auto' }} className="glass-panel">
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h2>Verify Mobile OTP</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              We sent a verification code to <strong>+91 ******{phone.slice(-4)}</strong> via your Account Aggregator portal.
            </p>
          </div>

          <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Enter 6-Digit Code</label>
              <input
                required
                type="text"
                placeholder="e.g. 123456"
                maxLength={6}
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                style={{ letterSpacing: '0.5rem', textAlign: 'center', fontSize: '1.5rem', fontWeight: 800, padding: '0.75rem' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.25rem' }}>
                Enter code <strong>123456</strong> or any 6 digits to verify mock.
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>
                {otpTimer > 0 ? `Resend code in ${otpTimer}s` : 'Did not receive code?'}
              </span>
              <button 
                type="button" 
                disabled={otpTimer > 0} 
                onClick={() => { setOtpTimer(30); }}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
              >
                Resend SMS
              </button>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setConnState('disconnected')}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={otp.length < 6}>
                Verify & Grant Consent
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Visual State 3: AI Processing Loader ── */}
      {connState === 'linking' && (
        <div style={{ maxWidth: '520px', margin: '4rem auto', textAlign: 'center' }} className="glass-panel">
          <Loader2 size={48} color="var(--primary)" style={{ animation: 'spin 1.5s linear infinite', margin: '0 auto 1.5rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Analyzing Bank Ledger</h3>
          
          <div style={{ height: '6px', background: 'var(--bg-light-elem)', borderRadius: '99px', overflow: 'hidden', margin: '1rem 0' }}>
            <div style={{ height: '100%', width: `${linkingProgress}%`, background: 'var(--primary)', borderRadius: '99px', transition: 'width 0.15s ease' }} />
          </div>
          
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
            {loadingText}
          </p>
        </div>
      )}

      {/* ── Visual State 4: Connected Dashboard ── */}
      {connState === 'connected' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Bank Info Header Card */}
          <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid var(--secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle color="var(--secondary)" size={24} />
              </div>
              <div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Linked Financial Institution</p>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {selectedBank} 
                  <span style={{ fontSize: '0.75rem', background: 'var(--bg-light-elem)', color: 'var(--secondary)', border: '1px solid var(--glass-border)', padding: '0.1rem 0.5rem', borderRadius: '99px' }}>
                    Active Consent
                  </span>
                </h3>
              </div>
            </div>

            <button className="btn btn-outline" onClick={handleDisconnect} style={{ color: 'var(--accent)', border: '1px solid rgba(244,63,94,0.3)', padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              Revoke Consent
            </button>
          </div>

          {/* Subscriptions & Cash Sweeps Section */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', alignItems: 'start' }}>
            
            {/* Left Col: Subscription Leak Finder */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="glass-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.15rem' }}>
                    <Sparkles color="var(--primary)" size={20} />
                    Recurring Subscription Leak Audits
                  </h3>
                  <span style={{ fontSize: '0.8rem', background: 'rgba(244,63,94,0.15)', color: 'var(--accent)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 700 }}>
                    {subLeaks.length} Cost Leaks Found
                  </span>
                </div>

                {/* Savings summary */}
                <div style={{ background: 'rgba(244,63,94,0.04)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 'var(--radius-md)', padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <AlertTriangle size={24} color="var(--accent)" style={{ flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>Projected Annual Drag</strong>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      You spend <strong style={{ color: 'var(--accent)' }}>{FMT(totalSubSpend)}/month</strong> on digital services. Consolidating leaks recovers <strong style={{ color: 'var(--secondary)' }}>{FMT(totalAnnualSavings)}/year</strong>.
                    </p>
                  </div>
                </div>

                {/* Subscriptions Leaks List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {subLeaks.map((leak, idx) => (
                    <div key={idx} style={{ background: 'var(--bg-light-elem)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent)' }}>{leak.title}</h4>
                        <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--secondary)' }}>Saves {FMT(leak.saving)}/mo</span>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                        {leak.desc}
                      </p>
                      <div style={{ borderTop: '1px dashed var(--glass-border)', paddingTop: '0.6rem', marginTop: '0.25rem', fontSize: '0.8rem', color: 'var(--text-main)', display: 'flex', gap: '0.4rem', alignItems: 'flex-start' }}>
                        <span style={{ color: 'var(--primary)', fontWeight: 700 }}>Action:</span>
                        <span>{leak.action}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transactions Ledger */}
              <div className="glass-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.1rem' }}>AI Transaction Cleaner Output</h3>
                  
                  <button 
                    onClick={() => setShowRaw(v => !v)}
                    className="btn btn-outline" 
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                  >
                    <Eye size={12} />
                    {showRaw ? 'Hide Raw UPI Codes' : 'Compare Raw UPI Codes'}
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '400px', overflowY: 'auto' }}>
                  {MOCK_TRANSACTIONS.map(tx => (
                    <div 
                      key={tx.id} 
                      style={{ 
                        padding: '0.75rem 1rem', 
                        background: 'var(--bg-light-elem)', 
                        border: '1px solid var(--glass-border)', 
                        borderRadius: 'var(--radius-sm)', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center' 
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                        <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{tx.logo}</span>
                        <div style={{ overflow: 'hidden' }}>
                          <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)', display: 'block' }}>{tx.clean}</strong>
                          
                          {showRaw ? (
                            <span style={{ fontSize: '0.7rem', color: 'var(--accent)', fontFamily: 'monospace', display: 'block', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                              {tx.raw}
                            </span>
                          ) : (
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{tx.category}</span>
                              <span>•</span>
                              <span>{tx.date}</span>
                              {tx.isSubscription && (
                                <>
                                  <span>•</span>
                                  <span style={{ color: '#d97706', fontWeight: 600 }}>Recurring Bill</span>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <span style={{ fontWeight: 800, fontSize: '0.95rem', flexShrink: 0 }}>
                        -{FMT(tx.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Col: Idle Cash Sweep Yield Optimizer */}
            <div className="glass-panel" style={{ borderTop: '4px solid var(--primary)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.15rem' }}>
                <Sparkles color="var(--primary)" size={20} />
                Idle Cash Sweep Optimizer
              </h3>
              
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                Banks typically pay a low 3.0% - 3.5% yield on normal savings account balances. Setting up an automated sweep captures higher money-market returns with zero lock-in drag.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.5rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Your Average Idle Bank Balance (₹)</label>
                <input 
                  type="number" 
                  value={idleCash || ''} 
                  onChange={e => setIdleCash(Number(e.target.value))}
                  placeholder="e.g. 150000"
                  style={{ padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', fontSize: '1.1rem', fontWeight: 700 }}
                />
              </div>

              {/* Comparison Results */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                
                {/* Standard Savings Yield */}
                <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-light-elem)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Standard Savings Return (3.5%)</span>
                    <strong style={{ display: 'block', fontSize: '1.1rem' }}>{FMT(sweepSummary.standardReturn)}/year</strong>
                  </div>
                  <span title="Standard low banking interest rate"><HelpCircle size={16} color="var(--text-muted)" /></span>
                </div>

                {/* Liquid Funds Yield */}
                <div style={{ padding: '0.75rem 1rem', background: 'rgba(59,130,246,0.03)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sweep to Liquid Mutual Funds (6.5%)</span>
                    <strong style={{ display: 'block', fontSize: '1.1rem', color: 'var(--primary)' }}>{FMT(sweepSummary.liquidReturn)}/year</strong>
                    <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 600 }}>Adds {FMT(sweepSummary.liquidExtra)} extra interest</span>
                  </div>
                  <span title="Rebalanced cash yield"><RefreshCw size={16} color="var(--primary)" /></span>
                </div>

                {/* Arbitrage Funds Yield */}
                <div style={{ padding: '0.75rem 1rem', background: 'rgba(16,185,129,0.03)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sweep to Arbitrage Funds (6.8%)</span>
                    <strong style={{ display: 'block', fontSize: '1.1rem', color: 'var(--secondary)' }}>{FMT(sweepSummary.arbitrageReturn)}/year</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 600 }}>Adds {FMT(sweepSummary.arbitrageExtra)} extra interest</span>
                  </div>
                  <span title="Optimal equity tax treatment"><CheckCircle size={16} color="var(--secondary)" /></span>
                </div>
              </div>

              {/* Sweep Explanation */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <Info size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '0.2rem' }}>The Arbitrage Tax Advantage</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    Fixed deposit and standard bank interest are taxed at your full slab rate (up to 30%+). Arbitrage mutual funds mimic debt-level safety but are taxed under **Equity LTCG rules** (10% on gains &gt; ₹1.25L), saving high earners substantial tax money on short-term cash deposits!
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
