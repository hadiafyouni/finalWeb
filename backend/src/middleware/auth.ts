import { FastifyRequest, FastifyReply } from 'fastify';

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  // Accept token from httpOnly cookie OR Authorization header (cross-domain fallback)
  let token = request.cookies?.auth_token;
  if (!token) {
    const header = request.headers.authorization;
    if (header?.startsWith('Bearer ')) token = header.slice(7);
  }
  if (!token) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }
  try {
    const payload = request.server.jwt.verify(token) as {
      id: string; email: string; role: 'admin' | 'viewer'; name: string;
    };
    (request as any).user = payload;
  } catch {
    return reply.status(401).send({ error: 'Invalid or expired token' });
  }
}

export async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
  await requireAuth(request, reply);
  if (reply.sent) return;
  if ((request as any).user?.role !== 'admin') {
    return reply.status(403).send({ error: 'Admin access required' });
  }
}
