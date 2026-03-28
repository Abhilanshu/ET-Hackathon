import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setError('');

    let success = false;
    if (isLogin) {
      success = await login(email, password);
    } else {
      success = await register(name, email, password);
    }

    if (success) {
      navigate('/dashboard');
    } else {
      setError('Invalid credentials or user already exists. Please try again.');
    }
  };

  return (
    <div className="animate-fade-in-up" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>

      <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ width: '64px', height: '64px', background: 'var(--primary)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: 'var(--shadow-glow)' }}>
            <ShieldCheck size={36} color="white" />
          </div>
          <h2 style={{ fontSize: '2rem' }}>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p style={{ marginTop: '0.5rem', fontSize: '1.1rem' }}>Secure your financial future with MentorAI.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {!isLogin && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={e => setName(e.target.value)}
                required={!isLogin}
              />
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Email Address</label>
            <input
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
              Password
              {isLogin && <a href="#" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>Forgot?</a>}
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div style={{ color: 'var(--accent)', fontSize: '0.9rem', textAlign: 'center', fontWeight: 500 }}>{error}</div>}

          <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', padding: '1.25rem', width: '100%' }}>
            {isLogin ? 'Sign In' : 'Get Started'} <ArrowRight size={20} />
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.95rem' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </div>
      </div>

    </div>
  );
}
