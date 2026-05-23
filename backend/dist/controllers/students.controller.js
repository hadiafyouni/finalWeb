"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listStudents = listStudents;
exports.getStudent = getStudent;
exports.createStudent = createStudent;
exports.editStudent = editStudent;
exports.deleteStudent = deleteStudent;
const store_1 = require("../store");
// ── GET /api/students ──────────────────────────────────────────
async function listStudents(_req, reply) {
    return reply.send((0, store_1.getAllStudents)());
}
// ── GET /api/students/:id ──────────────────────────────────────
async function getStudent(request, reply) {
    const id = parseInt(request.params.id);
    const student = (0, store_1.getStudentById)(id);
    if (!student)
        return reply.status(404).send({ error: 'Student not found' });
    return reply.send(student);
}
// ── POST /api/students ─────────────────────────────────────────
async function createStudent(request, reply) {
    const { first_name, last_name, student_email, major, enrollment_year, gpa } = request.body;
    if (!first_name || !last_name || !student_email || !major || !enrollment_year) {
        return reply.status(400).send({ error: 'first_name, last_name, student_email, major and enrollment_year are required' });
    }
    const student = (0, store_1.addStudent)({
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        student_email: student_email.trim().toLowerCase(),
        major: major.trim(),
        enrollment_year: Number(enrollment_year),
        gpa: gpa !== undefined && gpa !== '' && gpa !== null ? Number(gpa) : null,
    });
    return reply.status(201).send(student);
}
// ── PATCH /api/students/:id ────────────────────────────────────
async function editStudent(request, reply) {
    const id = parseInt(request.params.id);
    const body = request.body;
    const patch = {};
    if (body.first_name)
        patch.first_name = body.first_name.trim();
    if (body.last_name)
        patch.last_name = body.last_name.trim();
    if (body.student_email)
        patch.student_email = body.student_email.trim().toLowerCase();
    if (body.major)
        patch.major = body.major.trim();
    if (body.enrollment_year)
        patch.enrollment_year = Number(body.enrollment_year);
    if (body.gpa !== undefined) {
        patch.gpa = body.gpa === null || body.gpa === '' ? null : Number(body.gpa);
    }
    const updated = (0, store_1.updateStudent)(id, patch);
    if (!updated)
        return reply.status(404).send({ error: 'Student not found' });
    return reply.send(updated);
}
// ── DELETE /api/students/:id ───────────────────────────────────
async function deleteStudent(request, reply) {
    const id = parseInt(request.params.id);
    const ok = (0, store_1.removeStudent)(id);
    if (!ok)
        return reply.status(404).send({ error: 'Student not found' });
    return reply.status(204).send();
}
//# sourceMappingURL=students.controller.js.map