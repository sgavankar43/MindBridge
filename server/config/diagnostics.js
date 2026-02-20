'use strict';

/**
 * MindBridge — Startup Service Diagnostics
 *
 * Called once at server start to verify that every external service
 * is reachable and properly configured. Each check is independent —
 * a failure in one service never prevents the others from reporting.
 *
 * Usage (in server.js):
 *   const runDiagnostics = require('./config/diagnostics');
 *   await runDiagnostics(env);
 */

const mongoose = require('mongoose');

// ── ANSI colour helpers (works in Node terminals + Render/Railway logs) ────────
const c = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    dim: '\x1b[2m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    bg: '\x1b[44m',   // blue background for banner
};

const OK = `${c.green}${c.bold}✅ CONNECTED${c.reset}`;
const FAIL = `${c.red}${c.bold}❌ FAILED${c.reset}`;
const WARN = `${c.yellow}${c.bold}⚠️  NOT CONFIGURED${c.reset}`;
const INFO = `${c.cyan}ℹ️ ${c.reset}`;

// ── Banner ────────────────────────────────────────────────────────────────────

function printBanner(env) {
    const line = '═'.repeat(54);
    console.log('');
    console.log(`${c.cyan}${c.bold}╔${line}╗${c.reset}`);
    console.log(`${c.cyan}${c.bold}║${c.reset}         🧠  MindBridge Server — Startup Check         ${c.cyan}${c.bold}║${c.reset}`);
    console.log(`${c.cyan}${c.bold}╚${line}╝${c.reset}`);
    console.log(`${c.dim}   Environment : ${env.NODE_ENV}${c.reset}`);
    console.log(`${c.dim}   Port        : ${env.PORT}${c.reset}`);
    console.log(`${c.dim}   Frontend    : ${env.CLIENT_URL}${c.reset}`);
    console.log(`${c.dim}   Time        : ${new Date().toLocaleString()}${c.reset}`);
    console.log('');
}

// ── Individual checks ─────────────────────────────────────────────────────────

async function checkMongoDB() {
    const label = 'MongoDB Atlas  ';
    const state = mongoose.connection.readyState;
    // readyState: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
    if (state === 1) {
        const host = mongoose.connection.host || 'atlas';
        console.log(`   📦 ${label} ${OK}   ${c.dim}(${host})${c.reset}`);
    } else if (state === 2) {
        // Still connecting from server.js — wait briefly
        await new Promise(r => setTimeout(r, 2000));
        const host = mongoose.connection.host || 'atlas';
        const connected = mongoose.connection.readyState === 1;
        console.log(`   📦 ${label} ${connected ? OK : FAIL}${connected ? `   ${c.dim}(${host})` : '   — still connecting'}${c.reset}`);
    } else {
        console.log(`   📦 ${label} ${FAIL}`);
        console.log(`      ${c.red}└─ Not connected — check MONGODB_URI in .env${c.reset}`);
    }
}

async function checkCloudinary() {
    const label = 'Cloudinary     ';
    const name = process.env.CLOUDINARY_CLOUD_NAME;
    const key = process.env.CLOUDINARY_API_KEY;
    const secret = process.env.CLOUDINARY_API_SECRET;

    const isPlaceholder = (v) => !v || ['your_cloud_name', 'your_api_key', 'your_api_secret', 'demo'].includes(v);

    if (isPlaceholder(name) || isPlaceholder(key) || isPlaceholder(secret)) {
        console.log(`   🖼️  ${label} ${WARN}  — set CLOUDINARY_* vars in .env`);
        return;
    }

    try {
        // Use Cloudinary's ping endpoint to verify credentials
        const cloudinary = require('cloudinary').v2;
        cloudinary.config({ cloud_name: name, api_key: key, api_secret: secret });
        await cloudinary.api.ping();
        console.log(`   🖼️  ${label} ${OK}   ${c.dim}(cloud: ${name})${c.reset}`);
    } catch (err) {
        const reason = err?.error?.message || err.message || 'unknown error';
        console.log(`   🖼️  ${label} ${FAIL}`);
        console.log(`      ${c.red}└─ ${reason}${c.reset}`);
    }
}

async function checkStripe() {
    const label = 'Stripe         ';
    const key = process.env.STRIPE_SECRET_KEY;

    if (!key || key === 'sk_test_your_stripe_key' || key === 'sk_live_your_stripe_key') {
        console.log(`   💳 ${label} ${WARN}  — set STRIPE_SECRET_KEY in .env`);
        return;
    }

    try {
        const stripe = require('stripe')(key);
        const account = await stripe.accounts.retrieve();
        const mode = key.startsWith('sk_live_') ? 'LIVE' : 'TEST';
        console.log(`   💳 ${label} ${OK}   ${c.dim}(mode: ${mode} | account: ${account.id})${c.reset}`);

        // Warn if webhook secret is missing
        if (!process.env.STRIPE_WEBHOOK_SECRET) {
            console.log(`      ${c.yellow}└─ ⚠️  STRIPE_WEBHOOK_SECRET not set — webhooks won't verify${c.reset}`);
        } else {
            console.log(`      ${c.dim}└─ Webhook secret: configured${c.reset}`);
        }
    } catch (err) {
        const reason = err?.raw?.message || err.message || 'unknown error';
        console.log(`   💳 ${label} ${FAIL}`);
        console.log(`      ${c.red}└─ ${reason}${c.reset}`);
    }
}

async function checkGemini() {
    const label = 'Gemini AI      ';
    const key = process.env.GEMINI_API_KEY;

    if (!key || key === 'your_gemini_api_key') {
        console.log(`   🤖 ${label} ${WARN}  — set GEMINI_API_KEY in .env`);
        return;
    }

    try {
        // Lightweight check: just call the models list endpoint (no text generation = no cost)
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`,
            { signal: AbortSignal.timeout(6000) }
        );

        if (response.ok) {
            const data = await response.json();
            const count = data.models?.length ?? '?';
            console.log(`   🤖 ${label} ${OK}   ${c.dim}(${count} models available)${c.reset}`);
        } else {
            const err = await response.json().catch(() => ({}));
            throw new Error(err?.error?.message || `HTTP ${response.status}`);
        }
    } catch (err) {
        console.log(`   🤖 ${label} ${FAIL}`);
        console.log(`      ${c.red}└─ ${err.message}${c.reset}`);
    }
}

async function checkLiveKit() {
    const label = 'LiveKit Server ';
    const wsURL = process.env.LIVEKIT_URL;
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    const missing = [];
    if (!wsURL) missing.push('LIVEKIT_URL');
    if (!apiKey) missing.push('LIVEKIT_API_KEY');
    if (!apiSecret) missing.push('LIVEKIT_API_SECRET');

    if (missing.length) {
        console.log(`   🎙️  ${label} ${WARN}  — set ${missing.join(', ')} in .env`);
        return;
    }

    try {
        // LiveKit REST health: GET /rooms requires a valid API token
        const { AccessToken } = require('livekit-server-sdk');
        const token = new AccessToken(apiKey, apiSecret, { ttl: '10s' });
        const jwt = await token.toJwt();

        // Normalise ws(s):// → http(s)://
        const httpBase = wsURL.replace(/^wss?:\/\//, (prefix) =>
            prefix.startsWith('wss') ? 'https://' : 'http://'
        );

        const res = await fetch(`${httpBase}/twirp/livekit.RoomService/ListRooms`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt}`,
            },
            body: JSON.stringify({}),
            signal: AbortSignal.timeout(6000),
        });

        if (res.ok || res.status === 200) {
            const host = new URL(httpBase).hostname;
            console.log(`   🎙️  ${label} ${OK}   ${c.dim}(${host})${c.reset}`);
        } else if (res.status === 401) {
            console.log(`   🎙️  ${label} ${FAIL}`);
            console.log(`      ${c.red}└─ 401 Unauthorized — check LIVEKIT_API_KEY / LIVEKIT_API_SECRET${c.reset}`);
        } else {
            throw new Error(`HTTP ${res.status}`);
        }
    } catch (err) {
        // livekit-server-sdk not installed yet → friendly hint
        if (err.code === 'MODULE_NOT_FOUND') {
            console.log(`   🎙️  ${label} ${WARN}  — run: npm install livekit-server-sdk`);
        } else {
            console.log(`   🎙️  ${label} ${FAIL}`);
            console.log(`      ${c.red}└─ ${err.message}${c.reset}`);
        }
    }
}

function checkSocketIO() {
    // Socket.IO is embedded — just confirm it will be initialised
    const label = 'Socket.IO      ';
    console.log(`   🔌 ${label} ${OK}   ${c.dim}(embedded)${c.reset}`);
}

// ── Footer ────────────────────────────────────────────────────────────────────

function printFooter(port) {
    console.log('');
    console.log(`${c.cyan}${c.dim}   ─────────────────────────────────────────────────────${c.reset}`);
    console.log(`${c.green}${c.bold}   🚀 Server ready → http://localhost:${port}${c.reset}`);
    console.log(`${c.dim}   Health check  → http://localhost:${port}/api/health${c.reset}`);
    console.log('');
}

// ── Main export ───────────────────────────────────────────────────────────────

async function runDiagnostics(env) {
    printBanner(env);
    console.log(`${c.bold}   Service Status${c.reset}`);
    console.log(`${c.dim}   ───────────────────────────────────────────────────${c.reset}`);

    // MongoDB: read existing connection — server.js already called mongoose.connect()
    await checkMongoDB();

    // Run remaining checks in parallel for speed
    await Promise.all([
        checkCloudinary(),
        checkStripe(),
        checkGemini(),
        checkLiveKit(),
    ]);

    checkSocketIO();

    printFooter(env.PORT);
}

module.exports = runDiagnostics;
