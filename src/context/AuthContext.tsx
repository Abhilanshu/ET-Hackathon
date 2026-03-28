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
    } catch (err) {
      console.error(err);
    }
  };

  const connectBankToDB = async (bankName: string): Promise<boolean> => {
    const token = localStorage.getItem('mentorai_token');
    if (!token) return false;
    try {
      const res = await fetch('/api/finance/connect-bank', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bankName })
      });
      if (res.ok) {
        setPortfolio(await res.json());
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  useEffect(() => {
    // Check local storage on mount
    const storedUser = localStorage.getItem('mentorai_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      fetchPortfolio();
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) return false;
      const data = await res.json();
      setUser(data.user);
      localStorage.setItem('mentorai_user', JSON.stringify(data.user));
      localStorage.setItem('mentorai_token', data.token);
      fetchPortfolio();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      if (!res.ok) return false;
      const data = await res.json();
      setUser(data.user);
      localStorage.setItem('mentorai_user', JSON.stringify(data.user));
      localStorage.setItem('mentorai_token', data.token);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
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
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
