import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Zap, Loader2 } from 'lucide-react';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const modeParam = searchParams.get('mode');
  const [isLogin, setIsLogin] = useState(modeParam === 'login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    if (!isLogin && !name.trim()) { setError('Please enter your full name.'); return; }
    setError('');
    setLoading(true);

    let success = false;
    if (isLogin) {
      success = await login(email, password);
    } else {
      success = await register(name.trim(), email, password);
    }

    setLoading(false);

    if (success) {
      navigate('/dashboard');
    } else {
      setError(
        isLogin
          ? 'No account found with those credentials. Sign up first, or check your email/password.'
          : 'An account with this email already exists. Try logging in instead.'
      );
    }
  };

  const switchMode = () => {
    setIsLogin(v => !v);
    setError('');
    setName('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="animate-fade-in-up" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>

      <div className="glass-panel" style={{ width: '100%', maxWidth: '460px', padding: '3rem' }}>

        {/* Logo + Heading */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ width: '64px', height: '64px', background: 'var(--primary)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: 'var(--shadow-glow)' }}>
            <ShieldCheck size={36} color="white" />
          </div>
          <h2 style={{ fontSize: '2rem' }}>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p style={{ marginTop: '0.5rem', fontSize: '1rem' }}>Secure your financial future with MentorAI.</p>
        </div>

        {/* Demo mode notice */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem 1rem', background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.25)', borderRadius: 'var(--radius-sm)', marginBottom: '1.75rem' }}>
          <Zap size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            <strong style={{ color: 'var(--primary)' }}>Demo Mode:</strong> No backend required.{' '}
            {isLogin
              ? 'Sign up first to create a local account, then log in.'
              : 'Your account is saved in your browser — no server needed.'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {!isLogin && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Full Name</label>
              <input
                type="text"
                placeholder="Arjun Sharma"
                value={name}
                onChange={e => setName(e.target.value)}
                required={!isLogin}
                disabled={loading}
              />
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
              Password
            </label>
            <input
              type="password"
              placeholder="Min. 6 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={loading}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{ color: 'var(--accent)', fontSize: '0.875rem', textAlign: 'center', fontWeight: 500, padding: '0.6rem 1rem', background: 'rgba(244,63,94,0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(244,63,94,0.2)' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ marginTop: '0.5rem', padding: '1.25rem', width: '100%', opacity: loading ? 0.7 : 1 }}
          >
            {loading
              ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Processing...</>
              : <>{isLogin ? 'Sign In' : 'Get Started'} <ArrowRight size={20} /></>
            }
          </button>
        </form>

        {/* Switch mode */}
        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.95rem' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={switchMode}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}
          >
            {isLogin ? 'Sign up free' : 'Log in'}
          </button>
        </div>
      </div>

    </div>
  );
}
