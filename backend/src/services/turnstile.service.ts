export async function verifyTurnstile(token: string | undefined, ip?: string): Promise<boolean> {
  // No token at all → fail
  if (!token) return false;

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.warn('TURNSTILE_SECRET_KEY not set — skipping verification (dev only)');
    return true; // let dev work without the key
  }

  const body = new URLSearchParams();
  body.append('secret', secret);
  body.append('response', token);
  if (ip) body.append('remoteip', ip);

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
    });
    const data = await res.json() as { success: boolean };
    return data.success === true;
  } catch (err) {
    console.error('Turnstile verify error:', err);
    return false;
  }
}