import { FastifyRequest, FastifyReply } from 'fastify';
import {
  getAllStudents,
  getStudentById,
  addStudent,
  updateStudent,
  removeStudent,
} from '../store';

// ── GET /api/students ──────────────────────────────────────────
export async function listStudents(_req: FastifyRequest, reply: FastifyReply) {
  return reply.send(getAllStudents());
}

// ── GET /api/students/:id ──────────────────────────────────────
export async function getStudent(request: FastifyRequest, reply: FastifyReply) {
  const id = parseInt((request.params as { id: string }).id);
  const student = getStudentById(id);
  if (!student) return reply.status(404).send({ error: 'Student not found' });
  return reply.send(student);
}

// ── POST /api/students ─────────────────────────────────────────
export async function createStudent(request: FastifyRequest, reply: FastifyReply) {
  const { first_name, last_name, student_email, major, enrollment_year, gpa } =
    request.body as {
      first_name?: string; last_name?: string; student_email?: string;
      major?: string; enrollment_year?: number | string; gpa?: number | string | null;
    };

  if (!first_name || !last_name || !student_email || !major || !enrollment_year) {
    return reply.status(400).send({ error: 'first_name, last_name, student_email, major and enrollment_year are required' });
  }

  const student = addStudent({
    first_name: first_name.trim(),
    last_name:  last_name.trim(),
    student_email: student_email.trim().toLowerCase(),
    major: major.trim(),
    enrollment_year: Number(enrollment_year),
    gpa: gpa !== undefined && gpa !== '' && gpa !== null ? Number(gpa) : null,
  });

  return reply.status(201).send(student);
}

// ── PATCH /api/students/:id ────────────────────────────────────
export async function editStudent(request: FastifyRequest, reply: FastifyReply) {
  const id = parseInt((request.params as { id: string }).id);
  const body = request.body as {
    first_name?: string; last_name?: string; student_email?: string;
    major?: string; enrollment_year?: number | string; gpa?: number | string | null;
  };

  const patch: Record<string, unknown> = {};
  if (body.first_name)      patch.first_name      = body.first_name.trim();
  if (body.last_name)       patch.last_name       = body.last_name.trim();
  if (body.student_email)   patch.student_email   = body.student_email.trim().toLowerCase();
  if (body.major)           patch.major           = body.major.trim();
  if (body.enrollment_year) patch.enrollment_year = Number(body.enrollment_year);
  if (body.gpa !== undefined) {
    patch.gpa = body.gpa === null || body.gpa === '' ? null : Number(body.gpa);
  }

  const updated = updateStudent(id, patch);
  if (!updated) return reply.status(404).send({ error: 'Student not found' });
  return reply.send(updated);
}

// ── DELETE /api/students/:id ───────────────────────────────────
export async function deleteStudent(request: FastifyRequest, reply: FastifyReply) {
  const id = parseInt((request.params as { id: string }).id);
  const ok = removeStudent(id);
  if (!ok) return reply.status(404).send({ error: 'Student not found' });
  return reply.status(204).send();
}