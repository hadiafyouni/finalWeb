"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = authRoutes;
const auth_controller_1 = require("../controllers/auth.controller");
async function authRoutes(app) {
    app.post('/login', { config: { rateLimit: { max: 10, timeWindow: '15 minutes' } } }, auth_controller_1.login);
    app.post('/verify-otp', { config: { rateLimit: { max: 15, timeWindow: '15 minutes' } } }, auth_controller_1.verifyOTP);
    app.get('/me', auth_controller_1.me);
    app.post('/logout', auth_controller_1.logout);
}
//# sourceMappingURL=auth.routes.js.map