import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Home, LineChart, ShieldAlert, FileText, Users, Search, LogOut, X, Building, CheckCircle, Server, Activity, Loader2, Target, TrendingDown, PiggyBank, CreditCard } from 'lucide-react';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';

import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Goals from './pages/Goals';
import RiskSimulator from './pages/RiskSimulator';
import FirePlanner from './pages/FirePlanner';
import LifeEvents from './pages/LifeEvents';
import TaxWizard from './pages/TaxWizard';
import CouplesPlanner from './pages/CouplesPlanner';
import MFXray from './pages/MFXray';
import Auth from './pages/Auth';
import CashflowPredictor from './pages/CashflowPredictor';
import TaxOptimizer from './pages/TaxOptimizer';
import DebtManager from './pages/DebtManager';
import { ChatWidget } from './components/ChatWidget';
import { SmartNudge } from './components/SmartNudge';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { user, logout, connectBankToDB } = useAuth();

  const [showBankModal, setShowBankModal] = useState(false);
  const [bankStep, setBankStep] = useState<'select' | 'connecting' | 'success'>('select');
  const [showSystemModal, setShowSystemModal] = useState(false);

  const handleBankConnect = async (bankName: string) => {
    setBankStep('connecting');
    await connectBankToDB(bankName);
    setBankStep('success');
  };

  // Don't render sidebar if explicitly on login or landing page
  if (location.pathname === '/login' || location.pathname === '/') {
    return (
      <main
        className="app-container"
        style={{
          background: 'var(--bg-light)',
          flexDirection: 'column',
          width: '100vw',
          maxWidth: '100%',
          overflowX: 'hidden'
        }}
      >
        {children}
      </main>
    );
  }

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/goals', label: 'Financial Goals', icon: Target },
    { path: '/fire-planner', label: 'FIRE Planner', icon: LineChart },
    { path: '/life-events', label: 'Life Events', icon: ShieldAlert },
    { path: '/risk-simulator', label: 'Risk Engine', icon: Activity },
    { path: '/tax-wizard', label: 'Tax Wizard', icon: FileText },
    { path: '/couples-planner', label: 'Couples Planner', icon: Users },
    { path: '/mf-xray', label: 'MF X-Ray', icon: Search },
    { path: '/cashflow', label: 'Cash Flow', icon: TrendingDown },
    { path: '/tax-optimizer', label: 'Tax Optimizer', icon: PiggyBank },
    { path: '/debt-manager', label: 'Debt Manager', icon: CreditCard },
  ];

  return (
    <div className="app-container">
      <nav className="sidebar glass-panel">
        <div className="logo-container">
          <div className="logo-icon">▲</div>
          <h2 className="logo-text">Mentor<span className="text-gradient-primary">AI</span></h2>
        </div>

        <ul className="nav-links">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li key={item.path}>
                <Link to={item.path} className={`nav-link ${isActive ? 'active' : ''}`}>
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="sidebar-footer">
          <div className="user-profile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="avatar">{user?.name?.charAt(0).toUpperCase() || 'U'}</div>
              <div className="user-info">
                <p className="user-name">{user?.name || 'User'}</p>
                <p className="user-status" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.email}</p>
              </div>
            </div>
            <button onClick={logout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <header className="top-header glass-panel">
          <div className="header-search">
            <Search size={18} />
            <input type="text" placeholder="Ask MentorAI anything..." />
          </div>
          <div className="header-actions">
            <button className="btn btn-outline" onClick={() => { setShowBankModal(true); setBankStep('select'); }}>Connect Bank</button>
            <button className="btn btn-primary" onClick={() => setShowSystemModal(true)}>System Status</button>
          </div>
        </header>

        <div className="page-wrapper">
          {children}
        </div>

        {/* Bank Connection Modal */}
        {showBankModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', backgroundColor: 'var(--bg-light)', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem' }}><Building color="var(--primary)" size={24} /> Connect Bank Account</h2>
                <button onClick={() => setShowBankModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
              </div>

              {bankStep === 'select' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Select your primary bank to sync net worth and expenses securely.</p>
                  {['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank'].map(bank => (
                    <button key={bank} onClick={() => handleBankConnect(bank)} style={{ width: '100%', textAlign: 'left', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', cursor: 'pointer', background: 'var(--bg-light-elem)', color: 'var(--text-main)', fontSize: '1rem', fontWeight: 500 }}>
                      {bank}
                    </button>
                  ))}
                </div>
              )}

              {bankStep === 'connecting' && (
                <div style={{ padding: '2rem 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Loader2 size={48} color="var(--primary)" style={{ animation: 'spin 1.5s linear infinite', marginBottom: '1rem' }} />
                  <h3 style={{ marginBottom: '0.5rem' }}>Establishing Secure Connection</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Communicating with the bank's API...</p>
                </div>
              )}

              {bankStep === 'success' && (
                <div style={{ padding: '2rem 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <CheckCircle size={64} color="var(--secondary)" style={{ marginBottom: '1rem' }} />
                  <h3 style={{ marginBottom: '0.5rem', fontSize: '1.5rem' }}>Connection Successful!</h3>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>Your transactions are now synced securely.</p>
                  <button onClick={() => setShowBankModal(false)} className="btn btn-primary" style={{ width: '100%' }}>Return to Dashboard</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* System Status Modal */}
        {showSystemModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '350px', backgroundColor: 'var(--bg-light)', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem' }}><Server color="var(--primary)" size={24} /> System Status</h2>
                <button onClick={() => setShowSystemModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-light-elem)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>API Gateway</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Activity size={14} /> Operational</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-light-elem)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Database Sync</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Activity size={14} /> Up to date</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-light-elem)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>AI Inference</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Activity size={14} /> Operational</span>
                </div>
              </div>

              <button onClick={() => setShowSystemModal(false)} className="btn btn-outline" style={{ width: '100%', marginTop: '2rem' }}>Close</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/goals" element={<ProtectedRoute><Goals /></ProtectedRoute>} />
            <Route path="/risk-simulator" element={<ProtectedRoute><RiskSimulator /></ProtectedRoute>} />
            <Route path="/fire-planner" element={<ProtectedRoute><FirePlanner /></ProtectedRoute>} />
            <Route path="/life-events" element={<ProtectedRoute><LifeEvents /></ProtectedRoute>} />
            <Route path="/tax-wizard" element={<ProtectedRoute><TaxWizard /></ProtectedRoute>} />
            <Route path="/couples-planner" element={<ProtectedRoute><CouplesPlanner /></ProtectedRoute>} />
            <Route path="/mf-xray" element={<ProtectedRoute><MFXray /></ProtectedRoute>} />
            <Route path="/cashflow" element={<ProtectedRoute><CashflowPredictor /></ProtectedRoute>} />
            <Route path="/tax-optimizer" element={<ProtectedRoute><TaxOptimizer /></ProtectedRoute>} />
            <Route path="/debt-manager" element={<ProtectedRoute><DebtManager /></ProtectedRoute>} />
          </Routes>
        </Layout>
        <ChatWidget />
        <SmartNudge />
      </AuthProvider>
    </Router>
  );
}

export default App;
