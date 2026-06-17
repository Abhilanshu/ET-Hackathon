import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { Home, LineChart, ShieldAlert, FileText, Users, Search, LogOut, X, Building, CheckCircle, Server, Activity, Loader2, Target, TrendingDown, PiggyBank, CreditCard, Scale, Receipt, Coins, Lock, GraduationCap } from 'lucide-react';
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
import ExpensesTracker from './pages/ExpensesTracker';
import InvestmentsTracker from './pages/InvestmentsTracker';
import PortfolioRebalancer from './pages/PortfolioRebalancer';
import TaxHarvester from './pages/TaxHarvester';
import DrawdownSimulator from './pages/DrawdownSimulator';
import NomineeVault from './pages/NomineeVault';
import EducationPlanner from './pages/EducationPlanner';
import BankAnalyzer from './pages/BankAnalyzer';
import { ChatWidget } from './components/ChatWidget';
import { SmartNudge } from './components/SmartNudge';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, connectBankToDB } = useAuth();

  const [showBankModal, setShowBankModal] = useState(false);
  const [bankStep, setBankStep] = useState<'select' | 'connecting' | 'success'>('select');
  const [showSystemModal, setShowSystemModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const searchRoutes = [
    { path: '/dashboard', keywords: ['dashboard', 'home', 'overview', 'score'] },
    { path: '/goals', keywords: ['goals', 'goal', 'target', 'milestone', 'sip', 'savings'] },
    { path: '/bank-analyzer', keywords: ['bank', 'account', 'subscription', 'upi', 'transactions', 'sweep'] },
    { path: '/expenses', keywords: ['expenses', 'spending', 'budget', 'daily', 'food', 'bills'] },
    { path: '/investments', keywords: ['stocks', 'gold', 'nifty', 'portfolio', 'shares', 'invest'] },
    { path: '/rebalancer', keywords: ['rebalancer', 'asset', 'allocation', 'rebalance'] },
    { path: '/tax-harvester', keywords: ['tax loss', 'harvesting', 'ltcg', 'stcg'] },
    { path: '/drawdown-simulator', keywords: ['drawdown', 'retirement', 'withdrawal'] },
    { path: '/nominee-vault', keywords: ['nominee', 'vault', 'will', 'estate'] },
    { path: '/education-planner', keywords: ['education', 'college', 'school', 'child'] },
    { path: '/fire-planner', keywords: ['fire', 'financial independence', 'retire early'] },
    { path: '/life-events', keywords: ['life events', 'marriage', 'baby', 'job'] },
    { path: '/risk-simulator', keywords: ['risk', 'crisis', 'simulation', 'crash'] },
    { path: '/tax-wizard', keywords: ['tax', 'itr', 'deductions', '80c', 'tax wizard'] },
    { path: '/couples-planner', keywords: ['couples', 'partner', 'spouse', 'joint'] },
    { path: '/mf-xray', keywords: ['mutual fund', 'mf xray', 'overlap', 'fund analysis'] },
    { path: '/cashflow', keywords: ['cashflow', 'cash flow', 'runway', 'income'] },
    { path: '/tax-optimizer', keywords: ['tax optimizer', 'regime', 'new tax', 'old tax'] },
    { path: '/debt-manager', keywords: ['debt', 'loan', 'emi', 'avalanche', 'snowball'] },
  ];

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = searchRoutes.find(r => r.keywords.some(k => q.includes(k)));
      if (match) {
        navigate(match.path);
        setSearchQuery('');
        setShowSearchResults(false);
      }
    }
  };

  const filteredResults = searchQuery.trim()
    ? searchRoutes.filter(r => r.keywords.some(k => k.includes(searchQuery.toLowerCase())))
    : [];

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
    { path: '/bank-analyzer', label: 'Bank Intelligence', icon: Building },
    { path: '/expenses', label: 'Daily Expenses', icon: Receipt },
    { path: '/investments', label: 'Stocks & Gold', icon: Coins },
    { path: '/rebalancer', label: 'Asset Rebalancer', icon: Scale },
    { path: '/tax-harvester', label: 'Tax Harvester', icon: TrendingDown },
    { path: '/drawdown-simulator', label: 'Drawdown Engine', icon: LineChart },
    { path: '/nominee-vault', label: 'Nominee Vault', icon: Lock },
    { path: '/education-planner', label: 'Education Planner', icon: GraduationCap },
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
      <nav className="sidebar glass-panel" style={{ height: '100vh', overflowY: 'auto', position: 'sticky', top: 0 }}>
        <div className="logo-container" style={{ marginBottom: '2rem' }}>
          <img src="/logo.png" alt="MentorAI" style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover' }} />
          <h2 className="logo-text">Mentor<span className="text-gradient-primary">AI</span></h2>
        </div>

        <ul className="nav-links" style={{ gap: '0.25rem' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li key={item.path}>
                <Link to={item.path} className={`nav-link ${isActive ? 'active' : ''}`} style={{ padding: '0.75rem 1rem' }}>
                  <Icon size={18} />
                  <span style={{ fontSize: '0.9rem' }}>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="sidebar-footer" style={{ marginTop: '1.5rem', paddingTop: '0.75rem' }}>
          <div className="user-profile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '0.85rem' }}>{user?.name?.charAt(0).toUpperCase() || 'U'}</div>
              <div className="user-info">
                <p className="user-name" style={{ fontSize: '0.85rem' }}>{user?.name || 'User'}</p>
                <p className="user-status" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{user?.email}</p>
              </div>
            </div>
            <button onClick={logout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </nav>

      <main className="main-content" style={{ minHeight: '100vh' }}>
        <header className="top-header glass-panel">
          <div className="header-search" style={{ position: 'relative' }}>
            <Search size={18} />
            <input
              type="text"
              placeholder="Search pages — goals, tax, bank, stocks..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setShowSearchResults(true); }}
              onKeyDown={handleSearch}
              onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
              onFocus={() => setShowSearchResults(true)}
            />
            {showSearchResults && filteredResults.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-light)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-sm)', zIndex: 200, overflow: 'hidden', marginTop: '4px', boxShadow: 'var(--shadow-glass)' }}>
                {filteredResults.slice(0, 5).map(r => (
                  <button
                    key={r.path}
                    onMouseDown={() => { navigate(r.path); setSearchQuery(''); setShowSearchResults(false); }}
                    style={{ width: '100%', padding: '0.75rem 1rem', textAlign: 'left', background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', borderBottom: '1px solid var(--glass-border)', fontSize: '0.9rem' }}
                  >
                    {r.path.replace('/', '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Dashboard'}
                  </button>
                ))}
              </div>
            )}
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
            <Route path="/expenses" element={<ProtectedRoute><ExpensesTracker /></ProtectedRoute>} />
            <Route path="/investments" element={<ProtectedRoute><InvestmentsTracker /></ProtectedRoute>} />
            <Route path="/rebalancer" element={<ProtectedRoute><PortfolioRebalancer /></ProtectedRoute>} />
            <Route path="/tax-harvester" element={<ProtectedRoute><TaxHarvester /></ProtectedRoute>} />
            <Route path="/drawdown-simulator" element={<ProtectedRoute><DrawdownSimulator /></ProtectedRoute>} />
            <Route path="/nominee-vault" element={<ProtectedRoute><NomineeVault /></ProtectedRoute>} />
            <Route path="/education-planner" element={<ProtectedRoute><EducationPlanner /></ProtectedRoute>} />
            <Route path="/bank-analyzer" element={<ProtectedRoute><BankAnalyzer /></ProtectedRoute>} />
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
