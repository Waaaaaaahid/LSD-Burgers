const API_URL = (import.meta.env.VITE_API_URL || 'https://lsd-burgers-api.onrender.com').replace(/\/$/, '');
export async function api<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('lsd-auth-token') : null;
  const headers = new Headers(options.headers); headers.set('Content-Type','application/json'); if(token) headers.set('Authorization',`Bearer ${token}`);
  const response = await fetch(`${API_URL}${path}`,{...options,headers}); const data=await response.json().catch(()=>({}));
  if(!response.ok) throw new Error(data.message||`Request failed (${response.status})`); return data;
}
export function saveToken(token:string){localStorage.setItem('lsd-auth-token',token)}
export function clearToken(){localStorage.removeItem('lsd-auth-token')}
