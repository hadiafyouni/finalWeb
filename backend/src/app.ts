import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import cookie from '@fastify/cookie';
import rateLimit from '@fastify/rate-limit';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes';
import studentRoutes from './routes/students.routes';

dotenv.config();

const isProd = process.env.NODE_ENV === 'production';

export function buildApp() {
  const app = Fastify({
    logger: isProd
      ? true
      : { transport: { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname' } } },
    trustProxy: true,
  });

  // ── CORS ────────────────────────────────────────────────────
  const allowedOrigin = isProd ? (process.env.FRONTEND_URL ?? false) : true;
  app.register(cors, {
    origin: allowedOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // ── Helmet ──────────────────────────────────────────────────
  app.register(helmet, { contentSecurityPolicy: false });

  // ── JWT ─────────────────────────────────────────────────────
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.includes('replace') || secret.length < 32) {
    throw new Error('JWT_SECRET must be a strong unique secret (min 32 chars). Generate: openssl rand -hex 64');
  }
  app.register(jwt, { secret });

  // ── Cookies ─────────────────────────────────────────────────
  app.register(cookie);

  // ── Rate limit ──────────────────────────────────────────────
  app.register(rateLimit, {
    global: true,
    max: 300,
    timeWindow: '1 minute',
    errorResponseBuilder: () => ({
      error: 'Too many requests — slow down.',
    }),
  });

  // ── Routes ──────────────────────────────────────────────────
  app.register(authRoutes,   { prefix: '/api/auth' });
  app.register(studentRoutes, { prefix: '/api/students' });

  // ── Health ──────────────────────────────────────────────────
  app.get('/health', async () => ({ status: 'ok', ts: new Date().toISOString() }));

  return app;
}
