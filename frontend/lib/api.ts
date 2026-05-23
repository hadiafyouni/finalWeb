const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BASE_URL) {
  // This fires at build time if the variable is missing — you see it in
  // Railway build logs immediately rather than getting a silent localhost error.
  throw new Error(
    'NEXT_PUBLIC_API_URL is not set. ' +
    'Add it to the frontend service Variables tab in Railway before deploying.'
  );
}

const BASE = BASE_URL.replace(/\/$/, '');

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

// Stores the JWT in sessionStorage as a Bearer token fallback.
// The httpOnly cookie handles auth for same-origin requests automatically.
// The Bearer header covers cross-domain (different Railway subdomains in prod).
export const tokenStore = {
  get: (): string | undefined =>
    typeof window !== 'undefined' ? sessionStorage.getItem('jwt') ?? undefined : undefined,
  set: (t: string) => sessionStorage.setItem('jwt', t),
  clear: () => sessionStorage.removeItem('jwt'),
};
