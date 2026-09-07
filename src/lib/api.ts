const API_URL = (import.meta.env.VITE_API_URL || 'https://lsd-burgers-api.onrender.com').replace(/\/$/, '');

export async function api<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('lsd-auth-token') : null;
  const headers = new Headers(options.headers);
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers, mode: 'cors', credentials: 'omit' });
  } catch {
    throw new Error('Unable to connect to the server. Please try again in a few seconds.');
  }

  const text = await response.text();
  let data: any = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { message: text }; }
  if (!response.ok) throw new Error(data.message || `Request failed (${response.status})`);
  return data as T;
}

export function saveToken(token: string) { localStorage.setItem('lsd-auth-token', token); }
export function clearToken() { localStorage.removeItem('lsd-auth-token'); }
export function getApiUrl() { return API_URL; }
