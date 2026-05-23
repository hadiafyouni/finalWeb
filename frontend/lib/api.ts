const BASE = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000').replace(/\/$/, '');

export async function api<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, ...rest } = options;
  const headers: Record<string, string> = {
    ...(rest.headers as Record<string, string>),
  };
  if (rest.body) headers['Content-Type'] = 'application/json';
  if (token)     headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { credentials: 'include', ...rest, headers });

  if (res.status === 204) return null as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error ?? `HTTP ${res.status}`);
  return data as T;
}

// Store token in sessionStorage as Authorization fallback for cross-domain
export const tokenStore = {
  get: () => (typeof window !== 'undefined' ? sessionStorage.getItem('jwt') ?? undefined : undefined),
  set: (t: string) => sessionStorage.setItem('jwt', t),
  clear: () => sessionStorage.removeItem('jwt'),
};