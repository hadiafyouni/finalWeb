import { FastifyInstance } from 'fastify';
import { listStudents, getStudent, createStudent, editStudent, deleteStudent } from '../controllers/students.controller';
import { requireAuth, requireAdmin } from '../auth';

export default async function studentRoutes(app: FastifyInstance) {
  // Any logged-in user can read
  app.get('/',    { preHandler: requireAuth }, listStudents);
  app.get('/:id', { preHandler: requireAuth }, getStudent);

  // Admin only: write operations
  app.post('/',      { preHandler: requireAdmin }, createStudent);
  app.patch('/:id',  { preHandler: requireAdmin }, editStudent);
  app.delete('/:id', { preHandler: requireAdmin }, deleteStudent);
}