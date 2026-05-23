"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = studentRoutes;
const students_controller_1 = require("../controllers/students.controller");
const auth_1 = require("../auth");
async function studentRoutes(app) {
    // Any logged-in user can read
    app.get('/', { preHandler: auth_1.requireAuth }, students_controller_1.listStudents);
    app.get('/:id', { preHandler: auth_1.requireAuth }, students_controller_1.getStudent);
    // Admin only: write operations
    app.post('/', { preHandler: auth_1.requireAdmin }, students_controller_1.createStudent);
    app.patch('/:id', { preHandler: auth_1.requireAdmin }, students_controller_1.editStudent);
    app.delete('/:id', { preHandler: auth_1.requireAdmin }, students_controller_1.deleteStudent);
}
//# sourceMappingURL=student.routes.js.map