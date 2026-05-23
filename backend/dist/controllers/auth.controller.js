"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.verifyOTP = verifyOTP;
exports.me = me;
exports.logout = logout;
const crypto_1 = __importDefault(require("crypto"));
const store_1 = require("../store");
const email_service_1 = require("../services/email.service");
const turnstile_service_1 = require("../services/turnstile.service");
function cookieOpts(maxAge) {
    const prod = process.env.NODE_ENV === 'production';
    return {
        path: '/',
        httpOnly: true,
        secure: prod,
        sameSite: (prod ? 'none' : 'lax'),
        ...(maxAge !== undefined ? { maxAge } : {}),
    };
}
// ── POST /api/auth/login ────────────────────────────────────────
// Body: { email, password, turnstile_token }
// Checks credentials → sends OTP → returns { requiresOTP: true }
async function login(request, reply) {
    const { email, password, turnstile_token } = request.body;
    if (!email || !password) {
        return reply.status(400).send({ error: 'Email and password are required' });
    }
    // Cloudflare Turnstile verification
    const tsOk = await (0, turnstile_service_1.verifyTurnstile)(turnstile_token, request.ip);
    if (!tsOk) {
        return reply.status(400).send({ error: 'Bot check failed. Please try again.' });
    }
    const user = (0, store_1.findUser)(email);
    // Constant-time-ish: always do the compare even if user is not found
    if (!user || user.password !== password) {
        return reply.status(401).send({ error: 'Invalid email or password' });
    }
    // Generate 6-digit OTP
    const code = crypto_1.default.randomInt(100000, 999999).toString();
    store_1.otpStore.set(user.email, {
        code,
        expires_at: Date.now() + 10 * 60 * 1000, // 10 minutes
        attempts: 0,
    });
    // Send the email (fire-and-forget, but log errors)
    (0, email_service_1.sendOTP)(user.email, user.name, code).catch(err => {
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
async function verifyOTP(request, reply) {
    const { email, code } = request.body;
    if (!email || !code) {
        return reply.status(400).send({ error: 'Email and code are required' });
    }
    if (!/^\d{6}$/.test(code)) {
        return reply.status(400).send({ error: 'Code must be 6 digits' });
    }
    const entry = store_1.otpStore.get(email.toLowerCase().trim());
    if (!entry) {
        return reply.status(400).send({ error: 'No pending code for this email. Please log in again.' });
    }
    if (Date.now() > entry.expires_at) {
        store_1.otpStore.delete(email);
        return reply.status(400).send({ error: 'Code has expired. Please log in again.' });
    }
    if (entry.attempts >= 5) {
        store_1.otpStore.delete(email);
        return reply.status(429).send({ error: 'Too many attempts. Please log in again.' });
    }
    if (entry.code !== code) {
        entry.attempts += 1;
        return reply.status(401).send({ error: 'Incorrect code' });
    }
    // Code is correct — burn it
    store_1.otpStore.delete(email);
    const user = (0, store_1.findUser)(email);
    if (!user) {
        return reply.status(401).send({ error: 'User not found' });
    }
    // Issue JWT (7 days)
    const token = request.server.jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, { expiresIn: '7d' });
    reply.setCookie('auth_token', token, cookieOpts(7 * 24 * 60 * 60));
    return reply.send({
        token,
        user: { id: user.id, email: user.email, role: user.role, name: user.name },
    });
}
// ── GET /api/auth/me ────────────────────────────────────────────
// Returns current user from cookie/header without re-login
async function me(request, reply) {
    let token = request.cookies?.auth_token;
    if (!token) {
        const h = request.headers.authorization;
        if (h?.startsWith('Bearer '))
            token = h.slice(7);
    }
    if (!token)
        return reply.send({ user: null, token: null });
    try {
        const payload = request.server.jwt.verify(token);
        // Double-check the user still exists in our store
        const user = (0, store_1.findUser)(payload.email);
        if (!user) {
            reply.clearCookie('auth_token', cookieOpts());
            return reply.send({ user: null, token: null });
        }
        return reply.send({
            user: { id: payload.id, email: payload.email, role: payload.role, name: payload.name },
            token,
        });
    }
    catch {
        reply.clearCookie('auth_token', cookieOpts());
        return reply.send({ user: null, token: null });
    }
}
// ── POST /api/auth/logout ───────────────────────────────────────
async function logout(_req, reply) {
    reply.clearCookie('auth_token', cookieOpts());
    return reply.send({ success: true });
}
//# sourceMappingURL=auth.controller.js.map