'use client';
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { api, tokenStore } from '@/lib/api';

export interface AppUser { id: string; email: string; role: 'admin' | 'viewer'; name: string; }

interface Ctx {
  user: AppUser | null;
  loading: boolean;
  setSession: (token: string, user: AppUser) => void;
  logout: () => Promise<void>;
}

const UserCtx = createContext<Ctx | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = tokenStore.get();
    api<{ user: AppUser | null; token: string | null }>('/api/auth/me', { token: stored })
      .then(d => { if (d.user && d.token) { setUser(d.user); tokenStore.set(d.token); } else tokenStore.clear(); })
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false));
  }, []);

  const setSession = useCallback((token: string, u: AppUser) => {
    tokenStore.set(token);
    setUser(u);
    setLoading(false);
  }, []);

  const logout = useCallback(async () => {
    try { await api('/api/auth/logout', { method: 'POST' }); } catch {}
    tokenStore.clear();
    setUser(null);
  }, []);

  return <UserCtx.Provider value={{ user, loading, setSession, logout }}>{children}</UserCtx.Provider>;
}

export function useUser() {
  const ctx = useContext(UserCtx);
  if (!ctx) throw new Error('useUser must be inside UserProvider');
  return ctx;
}