'use strict';

// Load env vars FIRST — before any other require that might read process.env
require('dotenv').config();

// Validate env immediately after dotenv — fails fast in production
const validateEnv = require('./config/env');
const runDiagnostics = require('./config/diagnostics');
const env = validateEnv();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');

const { generalLimiter, authLimiter, aiLimiter, walletLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// ─── App bootstrap ──────────────────────────────────────────────────────────

const app = express();
const server = http.createServer(app);

if (env.NODE_ENV !== 'test') {
    console.log('🚀 Starting MindBridge Server...');
    console.log(`🌍 Environment: ${env.NODE_ENV}`);
}

// ─── Trust proxy (required for correct IP tracking behind Render/Railway/Heroku) ─

if (env.TRUST_PROXY) {
    app.set('trust proxy', 1);
}

// ─── Security headers (Helmet) ──────────────────────────────────────────────

app.use(helmet({
    // Allow inline scripts/styles needed by some clients — tighten in future
    contentSecurityPolicy: env.NODE_ENV === 'production' ? undefined : false,
    // HSTS only meaningful over HTTPS (production)
    hsts: env.NODE_ENV === 'production'
        ? { maxAge: 31536000, includeSubDomains: true, preload: true }
        : false,
}));

// ─── CORS ───────────────────────────────────────────────────────────────────

const allowedOrigins = env.CLIENT_URL
    .split(',')
    .map(url => url.trim())
    .filter(Boolean);

const corsOptions = {
    origin: (origin, callback) => {
        // Allow non-browser clients (curl, mobile, server-to-server)
        if (!origin) return callback(null, true);

        if (env.NODE_ENV === 'development') {
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight for all routes

// ─── Body parsing ────────────────────────────────────────────────────────────
//
// IMPORTANT: The Stripe webhook MUST receive the raw body for signature verification.
// Register express.raw() for that specific path BEFORE the global express.json().

app.use('/api/wallet/webhook', (req, res, next) => {
    console.log(`[Server] Webhook attempt: ${req.method} ${req.url}`);
    next();
});

app.use('/api/wallet/webhook', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '10kb' }));          // Prevent large JSON payload attacks
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─── Global rate limiter ─────────────────────────────────────────────────────

app.use(generalLimiter);

// ─── Database ────────────────────────────────────────────────────────────────

const PLACEHOLDER_URI = 'mongodb+srv://username:password@cluster0.mongodb.net/mindbridge?retryWrites=true&w=majority';

if (env.MONGODB_URI && env.MONGODB_URI !== PLACEHOLDER_URI) {
    console.log('🔄 Connecting to MongoDB...');
    mongoose.connect(env.MONGODB_URI)
        .then(async () => {
            console.log('✅ Connected to MongoDB');

            // ── One-time migration: drop the stale stripeSessionId unique index ──
            // An older version of Transaction.js had `stripeSessionId: { unique: true }`
            // without `sparse: true`. That index rejects multiple null values, breaking
            // every wallet transfer. The field was renamed to paymentIntentId (sparse: true)
            // but the old index survives until explicitly dropped.
            try {
                await mongoose.connection.db
                    .collection('transactions')
                    .dropIndex('stripeSessionId_1');
                console.log('✅ Dropped stale transactions.stripeSessionId_1 index');
            } catch (e) {
                if (e.code !== 27) console.warn('⚠️ Could not drop stripeSessionId_1:', e.message);
            }

            // Drop paymentIntentId_1 index to ensure it is recreated as sparse
            try {
                await mongoose.connection.db
                    .collection('transactions')
                    .dropIndex('paymentIntentId_1');
                console.log('✅ Dropped transactions.paymentIntentId_1 index for recreation');
            } catch (e) {
                if (e.code !== 27) console.warn('⚠️ Could not drop paymentIntentId_1 index:', e.message);
            }
        })
        .catch(err => {
            console.error('❌ MongoDB connection error:', err.message);
            console.log('⚠️  Server will continue without database');
        });
} else {
    console.log('⚠️  No valid MONGODB_URI — update your .env file');
}

// ─── Routes ──────────────────────────────────────────────────────────────────

// Health / smoke-test (no rate-limit overhead)
app.get('/', (req, res) => res.json({ message: 'MindBridge API is running!' }));
app.get('/api/test', (req, res) => res.json({ message: 'API is working!' }));
app.get('/api/health', (req, res) => res.json({
    status: 'OK',
    environment: env.NODE_ENV,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
}));

// Auth routes — stricter rate limit to prevent brute-force
const authRoutes = require('./routes/auth');
app.use('/api/auth', authLimiter, authRoutes);

// AI routes — separate limiter because inference is expensive
const aiRoutes = require('./routes/ai');
app.use('/api/ai', aiLimiter, aiRoutes);

// Standard authenticated routes — covered by generalLimiter already
const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);

const postRoutes = require('./routes/posts');
app.use('/api/posts', postRoutes);

// const adminRoutes = require('./routes/admin');
// app.use('/api/admin', adminRoutes);

const messageRoutes = require('./routes/messages');
app.use('/api/messages', messageRoutes);

// Wallet routes — walletLimiter on checkout + transfer (tight in prod, relaxed in dev)
const walletRoutes = require('./routes/wallet');
app.use('/api/wallet', walletLimiter, walletRoutes);

// ─── 404 + Global error handler (MUST be last) ───────────────────────────────

app.use(notFoundHandler);
app.use(errorHandler);

// ─── Socket.IO ───────────────────────────────────────────────────────────────

const io = new Server(server, {
    cors: {
        origin: env.NODE_ENV === 'development' ? true : allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

app.set('io', io);

// Socket auth middleware
io.use((socket, next) => {
    const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
        return next(new Error('Authentication error: no token provided'));
    }

    try {
        const decoded = jwt.verify(token, env.JWT_SECRET);
        socket.user = decoded;
        next();
    } catch {
        next(new Error('Authentication error: invalid token'));
    }
});

io.on('connection', (socket) => {
    const userId = socket.user?.userId;

    if (env.NODE_ENV !== 'production') {
        console.log(`🔌 Socket connected: ${socket.id} (user: ${userId})`);
    }

    if (userId) {
        socket.join(userId);
    }

    socket.on('disconnect', () => {
        if (env.NODE_ENV !== 'production') {
            console.log(`🔌 Socket disconnected: ${socket.id}`);
        }
    });
});

// ─── Start server ────────────────────────────────────────────────────────────

server.listen(env.PORT, () => {
    const base = env.NODE_ENV === 'production'
        ? `port ${env.PORT}`
        : `http://localhost:${env.PORT}`;
    console.log(`✅ Server running on ${base}`);

    // Fire diagnostics in background — never blocks request handling
    runDiagnostics(env).catch(() => { });
});

module.exports = { app, io };