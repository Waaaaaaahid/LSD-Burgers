import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from '@/lib/api';
import type { RestaurantSettings } from '@/types';
interface RestaurantContextValue { settings: RestaurantSettings | null; loading: boolean; refresh: () => Promise<void>; }
const RestaurantContext = createContext<RestaurantContextValue | undefined>(undefined);
export function RestaurantProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchSettings = async () => { try { const r = await api<{data: RestaurantSettings}>('/api/settings'); setSettings(r.data); } catch (e) { console.error(e); } finally { setLoading(false); } };
  useEffect(() => { fetchSettings(); }, []);
  return <RestaurantContext.Provider value={{ settings, loading, refresh: fetchSettings }}>{children}</RestaurantContext.Provider>;
}
export function useRestaurant() { const ctx = useContext(RestaurantContext); if (!ctx) throw new Error('useRestaurant must be used within RestaurantProvider'); return ctx; }
