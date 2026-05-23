import { FastifyRequest, FastifyReply } from 'fastify';
import crypto from 'crypto';
import { findUser, otpStore } from '../store';
import { sendOTP } from '../services/email.service';
import { verifyTurnstile } from '../services/turnstile.service';

function cookieOpts(maxAge?: number) {
  const prod = process.env.NODE_ENV === 'production';
  return {
    path: '/',
    httpOnly: true,
    secure: prod,
    sameSite: (prod ? 'none' : 'lax') as 'none' | 'lax',
    ...(maxAge !== undefined ? { maxAge } : {}),
  };
}

// ── POST /api/auth/login ────────────────────────────────────────
// Body: { email, password, turnstile_token }
// Checks credentials → sends OTP → returns { requiresOTP: true }
export async function login(request: FastifyRequest, reply: FastifyReply) {
  const { email, password, turnstile_token } = request.body as {
    email?: string; password?: string; turnstile_token?: string;
  };

  if (!email || !password) {
    return reply.status(400).send({ error: 'Email and password are required' });
  }

  // Cloudflare Turnstile verification
  const tsOk = await verifyTurnstile(turnstile_token, request.ip);
  if (!tsOk) {
    return reply.status(400).send({ error: 'Bot check failed. Please try again.' });
  }

  const user = findUser(email);

  // Constant-time-ish: always do the compare even if user is not found
  if (!user || user.password !== password) {
    return reply.status(401).send({ error: 'Invalid email or password' });
  }

  // Generate 6-digit OTP
  const code = crypto.randomInt(100000, 999999).toString();
  otpStore.set(user.email, {
    code,
    expires_at: Date.now() + 10 * 60 * 1000, // 10 minutes
    attempts: 0,
  });

  // Send the email (fire-and-forget, but log errors)
  sendOTP(user.email, user.name, code).catch(err => {
    console.error('Failed to send OTP email:', err);
  });

  // Always log in dev so you can test without real email
  if (process.env.NODE_ENV !== 'production') {
    console.log(`📧 [DEV] OTP for ${user.email}: ${code}`);
  }

  return reply.send({ requiresOTP: true, email: user.email });
}

// ── POST /api/auth/verify-otp ───────────────────────────────────
// Body: { email, code }
// Verifies OTP → issues JWT in httpOnly cookie + JSON response
export async function verifyOTP(request: FastifyRequest, reply: FastifyReply) {
  const { email, code } = request.body as { email?: string; code?: string };

  if (!email || !code) {
    return reply.status(400).send({ error: 'Email and code are required' });
  }
  if (!/^\d{6}$/.test(code)) {
    return reply.status(400).send({ error: 'Code must be 6 digits' });
  }

  const entry = otpStore.get(email.toLowerCase().trim());

  if (!entry) {
    return reply.status(400).send({ error: 'No pending code for this email. Please log in again.' });
  }
  if (Date.now() > entry.expires_at) {
    otpStore.delete(email);
    return reply.status(400).send({ error: 'Code has expired. Please log in again.' });
  }
  if (entry.attempts >= 5) {
    otpStore.delete(email);
    return reply.status(429).send({ error: 'Too many attempts. Please log in again.' });
  }
  if (entry.code !== code) {
    entry.attempts += 1;
    return reply.status(401).send({ error: 'Incorrect code' });
  }

  // Code is correct — burn it
  otpStore.delete(email);

  const user = findUser(email);
  if (!user) {
    return reply.status(401).send({ error: 'User not found' });
  }

  // Issue JWT (7 days)
  const token = request.server.jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    { expiresIn: '7d' },
  );

  reply.setCookie('auth_token', token, cookieOpts(7 * 24 * 60 * 60));

  return reply.send({
    token,
    user: { id: user.id, email: user.email, role: user.role, name: user.name },
  });
}

// ── GET /api/auth/me ────────────────────────────────────────────
// Returns current user from cookie/header without re-login
export async function me(request: FastifyRequest, reply: FastifyReply) {
  let token = request.cookies?.auth_token;
  if (!token) {
    const h = request.headers.authorization;
    if (h?.startsWith('Bearer ')) token = h.slice(7);
  }
  if (!token) return reply.send({ user: null, token: null });

  try {
    const payload = request.server.jwt.verify(token) as {
      id: string; email: string; role: 'admin' | 'viewer'; name: string; exp: number;
    };
    // Double-check the user still exists in our store
    const user = findUser(payload.email);
    if (!user) {
      reply.clearCookie('auth_token', cookieOpts());
      return reply.send({ user: null, token: null });
    }
    return reply.send({
      user: { id: payload.id, email: payload.email, role: payload.role, name: payload.name },
      token,
    });
  } catch {
    reply.clearCookie('auth_token', cookieOpts());
    return reply.send({ user: null, token: null });
  }
}

// ── POST /api/auth/logout ───────────────────────────────────────
export async function logout(_req: FastifyRequest, reply: FastifyReply) {
  reply.clearCookie('auth_token', cookieOpts());
  return reply.send({ success: true });
}