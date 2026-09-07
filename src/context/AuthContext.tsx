import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, clearToken, saveToken } from '@/lib/api';
import type { Profile } from '@/types';

export interface AuthSession { access_token: string; user: { id: string; email: string } }
interface AuthContextValue {
  session: AuthSession | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string, phone: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    try {
      const result = await api<{ user: Profile & { email: string } }>('/api/auth/me');
      setProfile(result.user);
      setSession({ access_token: localStorage.getItem('lsd-auth-token')!, user: { id: result.user.id, email: result.user.email } });
    } catch {
      clearToken(); setSession(null); setProfile(null);
    } finally { setLoading(false); }
  };

  useEffect(() => { if (localStorage.getItem('lsd-auth-token')) loadUser(); else setLoading(false); }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const result = await api<{ token: string; user: Profile & { email: string } }>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      saveToken(result.token);
      setSession({ access_token: result.token, user: { id: result.user.id, email: result.user.email } });
      setProfile(result.user);
      return { error: null };
    } catch (e) { return { error: e instanceof Error ? e.message : 'Sign in failed' }; }
  };

  const signUp = async (email: string, password: string, name: string, phone: string) => {
    try {
      const result = await api<{ token: string; user: Profile & { email: string } }>('/api/auth/signup', { method: 'POST', body: JSON.stringify({ email, password, name, phone }) });
      saveToken(result.token);
      setSession({ access_token: result.token, user: { id: result.user.id, email: result.user.email } });
      setProfile(result.user);
      return { error: null };
    } catch (e) { return { error: e instanceof Error ? e.message : 'Sign up failed' }; }
  };

  const signOut = async () => { clearToken(); setSession(null); setProfile(null); };
  const refreshProfile = async () => { if (session) await loadUser(); };

  return <AuthContext.Provider value={{ session, profile, loading, signIn, signUp, signOut, refreshProfile }}>{children}</AuthContext.Provider>;
}
export function useAuth() { const ctx = useContext(AuthContext); if (!ctx) throw new Error('useAuth must be used within AuthProvider'); return ctx; }
