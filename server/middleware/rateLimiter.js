'use strict';

const rateLimit = require('express-rate-limit');

/**
 * Environment-aware rate limiter configuration.
 *
 * Development  — limits are multiplied by 20 so React StrictMode's
 *                double-invoke and hot-reload never cause 429 errors.
 *
 * Production   — strict limits to protect against brute-force and abuse.
 *
 * All limiters share the same window and consistent error response shape.
 */

const IS_DEV = process.env.NODE_ENV !== 'production';
const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000; // 15 min

// In development every limit is multiplied by this factor so hot-reload and
// StrictMode double-invocations never cause 429 errors.
const DEV_MULTIPLIER = 20;

const cap = (prodMax) => IS_DEV ? prodMax * DEV_MULTIPLIER : prodMax;

const message = (action) => ({
    success: false,
    message: `Too many ${action} requests from this IP. Please try again later.`,
    retryAfter: `${WINDOW_MS / 60000} minutes`,
});

// ── Shared options every limiter inherits ────────────────────────────────────

const base = {
    windowMs: WINDOW_MS,
    standardHeaders: true,   // Adds RateLimit-* headers (RFC 6585)
    legacyHeaders: false,   // Removes deprecated X-RateLimit-* headers
    skip: (req) => req.method === 'OPTIONS', // Never block CORS preflight
};

// ── Limiters ─────────────────────────────────────────────────────────────────

/**
 * generalLimiter
 * Applied globally to every route.
 * Catches abusive traffic without impacting normal usage.
 *   prod:  200 req / 15 min
 *   dev: 4000 req / 15 min
 */
const generalLimiter = rateLimit({
    ...base,
    max: cap(parseInt(process.env.RATE_LIMIT_MAX, 10) || 200),
    message: message('API'),
});

/**
 * authLimiter
 * Login / register routes — prevents brute-force credential attacks.
 * Successful requests are NOT counted so real users are never locked out.
 *   prod:  10 req / 15 min
 *   dev:  200 req / 15 min
 */
const authLimiter = rateLimit({
    ...base,
    max: cap(10),
    message: message('authentication'),
    skipSuccessfulRequests: true,
});

/**
 * walletLimiter
 * Checkout session creation and credit transfers.
 * Tight in production; relaxed in development for testing.
 *   prod:   5 req / 15 min
 *   dev:  100 req / 15 min
 */
const walletLimiter = rateLimit({
    ...base,
    max: cap(5),
    message: message('wallet'),
});

/**
 * strictLimiter
 * Sensitive admin mutations and any other high-risk routes.
 *   prod:   5 req / 15 min
 *   dev:  100 req / 15 min
 */
const strictLimiter = rateLimit({
    ...base,
    max: cap(5),
    message: message('sensitive'),
});

/**
 * aiLimiter
 * AI inference calls are expensive — separate budget from wallet ops.
 *   prod:  30 req / 15 min
 *   dev:  600 req / 15 min
 */
const aiLimiter = rateLimit({
    ...base,
    max: cap(30),
    message: message('AI'),
});

// ── Debug log (only in development) ─────────────────────────────────────────

if (IS_DEV) {
    const w = Math.round(WINDOW_MS / 60000);
    console.log(
        `\x1b[33m   ⚡ Rate limits: DEV mode (×${DEV_MULTIPLIER}) — ` +
        `general:${cap(200)}, auth:${cap(10)}, wallet:${cap(5)}, ai:${cap(30)} per ${w}min\x1b[0m`
    );
}

module.exports = {
    generalLimiter,
    authLimiter,
    walletLimiter,
    strictLimiter,
    aiLimiter,
};
