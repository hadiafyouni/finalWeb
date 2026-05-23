import { FastifyInstance } from 'fastify';
import { login, verifyOTP, me, logout } from '../controllers/auth.controller';

export default async function authRoutes(app: FastifyInstance) {
  app.post('/login',      { config: { rateLimit: { max: 10, timeWindow: '15 minutes' } } }, login);
  app.post('/verify-otp', { config: { rateLimit: { max: 15, timeWindow: '15 minutes' } } }, verifyOTP);
  app.get('/me', me);
  app.post('/logout', logout);
}
