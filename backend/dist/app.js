"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildApp = buildApp;
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const helmet_1 = __importDefault(require("@fastify/helmet"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
const cookie_1 = __importDefault(require("@fastify/cookie"));
const rate_limit_1 = __importDefault(require("@fastify/rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const students_routes_1 = __importDefault(require("./routes/students.routes"));
dotenv_1.default.config();
const isProd = process.env.NODE_ENV === 'production';
function buildApp() {
    const app = (0, fastify_1.default)({
        logger: isProd
            ? true
            : { transport: { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname' } } },
        trustProxy: true,
    });
    // ── CORS ────────────────────────────────────────────────────
    const allowedOrigin = isProd ? (process.env.FRONTEND_URL ?? false) : true;
    app.register(cors_1.default, {
        origin: allowedOrigin,
        credentials: true,
        methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    });
    // ── Helmet ──────────────────────────────────────────────────
    app.register(helmet_1.default, { contentSecurityPolicy: false });
    // ── JWT ─────────────────────────────────────────────────────
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.includes('replace') || secret.length < 32) {
        throw new Error('JWT_SECRET must be a strong unique secret (min 32 chars). Generate: openssl rand -hex 64');
    }
    app.register(jwt_1.default, { secret });
    // ── Cookies ─────────────────────────────────────────────────
    app.register(cookie_1.default);
    // ── Rate limit ──────────────────────────────────────────────
    app.register(rate_limit_1.default, {
        global: true,
        max: 300,
        timeWindow: '1 minute',
        errorResponseBuilder: () => ({
            error: 'Too many requests — slow down.',
        }),
    });
    // ── Routes ──────────────────────────────────────────────────
    app.register(auth_routes_1.default, { prefix: '/api/auth' });
    app.register(students_routes_1.default, { prefix: '/api/students' });
    // ── Health ──────────────────────────────────────────────────
    app.get('/health', async () => ({ status: 'ok', ts: new Date().toISOString() }));
    return app;
}
//# sourceMappingURL=app.js.map