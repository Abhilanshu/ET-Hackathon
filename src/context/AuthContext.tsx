import React, { createContext, useContext, useState, useEffect } from 'react';

type User = {
  id: string;
  name: string;
  email: string;
};

export type Portfolio = {
  bankConnected: boolean;
  bankName: string | null;
  totalCorpus: number;
  sipAmount: number;
};

type AuthContextType = {
  user: User | null;
  portfolio: Portfolio | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  connectBankToDB: (bankName: string) => Promise<boolean>;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Local user store (mock DB in localStorage) ───────────────────────────────
const LOCAL_USERS_KEY = 'mentorai_local_users';

function getLocalUsers(): { email: string; password: string; name: string; id: string }[] {
  try { return JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]'); } catch { return []; }
}

function saveLocalUsers(users: ReturnType<typeof getLocalUsers>) {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

function mockToken(id: string) {
  // Simple base64 mock token (not for production — dev/demo only)
  return btoa(JSON.stringify({ id, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);

  const fetchPortfolio = async () => {
    const token = localStorage.getItem('mentorai_token');
    if (!token) return;
    try {
      const res = await fetch('/api/finance/portfolio', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setPortfolio(await res.json());
    } catch {
      // Server offline — portfolio stays null (not critical)
    }
  };

  const connectBankToDB = async (bankName: string): Promise<boolean> => {
    const token = localStorage.getItem('mentorai_token');
    if (!token) return false;
    try {
      const res = await fetch('/api/finance/connect-bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ bankName })
      });
      if (res.ok) { setPortfolio(await res.json()); return true; }
    } catch { /* server offline */ }

    // Fallback: mock bank connection locally
    const mockPortfolio: Portfolio = {
      bankConnected: true,
      bankName,
      totalCorpus: 2850000,
      sipAmount: 25000,
    };
    setPortfolio(mockPortfolio);
    return true;
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('mentorai_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      fetchPortfolio();
    }
  }, []);

  // ─── Login: try API → fallback to localStorage mock ───────────────────────
  const login = async (email: string, password: string): Promise<boolean> => {
    // 1. Try live server
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem('mentorai_user', JSON.stringify(data.user));
        localStorage.setItem('mentorai_token', data.token);
        fetchPortfolio();
        return true;
      }
      // Server responded with 4xx — credentials actually wrong, don't fall through
      if (res.status < 500) return false;
    } catch {
      // Server unreachable — use local mock
    }

    // 2. Offline fallback: check localStorage user store
    const users = getLocalUsers();
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!found) return false;

    const userData: User = { id: found.id, name: found.name, email: found.email };
    const token = mockToken(found.id);
    setUser(userData);
    localStorage.setItem('mentorai_user', JSON.stringify(userData));
    localStorage.setItem('mentorai_token', token);
    return true;
  };

  // ─── Register: try API → fallback to localStorage mock ────────────────────
  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    // 1. Try live server
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem('mentorai_user', JSON.stringify(data.user));
        localStorage.setItem('mentorai_token', data.token);
        return true;
      }
      if (res.status < 500) return false;
    } catch {
      // Server unreachable — use local mock
    }

    // 2. Offline fallback: save to localStorage user store
    const users = getLocalUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return false; // user already exists locally
    }

    const id = `local_${Date.now()}`;
    users.push({ id, name, email, password }); // NOTE: plain text only in this offline demo mode
    saveLocalUsers(users);

    const userData: User = { id, name, email };
    const token = mockToken(id);
    setUser(userData);
    localStorage.setItem('mentorai_user', JSON.stringify(userData));
    localStorage.setItem('mentorai_token', token);
    return true;
  };

  const logout = () => {
    setUser(null);
    setPortfolio(null);
    localStorage.removeItem('mentorai_user');
    localStorage.removeItem('mentorai_token');
  };

  return (
    <AuthContext.Provider value={{ user, portfolio, login, register, logout, connectBankToDB, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
