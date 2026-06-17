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
  /** Returns a user-scoped localStorage key so data never leaks between accounts */
  userKey: (key: string) => string;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Local user store (the registry of all accounts, shared) ─────────────────
const LOCAL_USERS_KEY = 'mentorai_local_users';

function getLocalUsers(): { email: string; password: string; name: string; id: string }[] {
  try { return JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]'); } catch { return []; }
}

function saveLocalUsers(users: ReturnType<typeof getLocalUsers>) {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

function mockToken(id: string) {
  return btoa(JSON.stringify({ id, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }));
}

/** Clear all session-level keys that belong to a specific user's session */
function clearSessionKeys() {
  // Only remove session/active-user keys — NOT the user registry or other users' data
  ['mentorai_user', 'mentorai_token'].forEach(k => localStorage.removeItem(k));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);

  /** Generates a user-scoped key: e.g. "mentorai_local_abc123_expenses" */
  const userKey = (key: string): string => {
    const u = user || (() => {
      try { return JSON.parse(localStorage.getItem('mentorai_user') || 'null'); } catch { return null; }
    })();
    return `mentorai_${u?.id || 'anon'}_${key}`;
  };

  const fetchPortfolio = async () => {
    const token = localStorage.getItem('mentorai_token');
    if (!token) return;
    try {
      const res = await fetch('/api/finance/portfolio', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setPortfolio(await res.json());
    } catch {
      // Server offline — portfolio stays null
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

    // Fallback: mock bank connection locally (scoped to this user)
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

  // ─── Login ────────────────────────────────────────────────────────────────
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
      if (res.status < 500) return false;
    } catch {
      // Server unreachable — use local fallback
    }

    // 2. Offline fallback: check localStorage user registry
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

  // ─── Register ─────────────────────────────────────────────────────────────
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
      // Server unreachable — use local fallback
    }

    // 2. Offline fallback: save to localStorage user registry
    const users = getLocalUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return false; // user already exists
    }

    const id = `local_${Date.now()}`;
    users.push({ id, name, email, password });
    saveLocalUsers(users);

    const userData: User = { id, name, email };
    const token = mockToken(id);
    setUser(userData);
    localStorage.setItem('mentorai_user', JSON.stringify(userData));
    localStorage.setItem('mentorai_token', token);
    return true;
  };

  // ─── Logout: clear session only, NOT other users' data ───────────────────
  const logout = () => {
    setUser(null);
    setPortfolio(null);
    clearSessionKeys();
  };

  return (
    <AuthContext.Provider value={{ user, portfolio, login, register, logout, connectBankToDB, isAuthenticated: !!user, userKey }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
