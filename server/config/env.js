'use strict';

/**
 * Environment variable validation.
 * Called once at startup — fails fast before connecting to DB or binding ports.
 */

const REQUIRED_IN_PRODUCTION = ['MONGODB_URI', 'JWT_SECRET', 'CLIENT_URL'];

const REQUIRED_ALWAYS = ['PORT', 'NODE_ENV'];

function validateEnv() {
    const missing = [];

    // Always required
    for (const key of REQUIRED_ALWAYS) {
        if (!process.env[key]) {
            missing.push(key);
        }
    }

    // Required in production only
    if (process.env.NODE_ENV === 'production') {
        for (const key of REQUIRED_IN_PRODUCTION) {
            if (!process.env[key]) {
                missing.push(key);
            }
        }
    }

    if (missing.length > 0) {
        console.error('❌ Missing required environment variables:');
        missing.forEach(key => console.error(`   • ${key}`));
        if (process.env.NODE_ENV === 'production') {
            // Hard fail in production
            process.exit(1);
        } else {
            // Warn in development
            console.warn('⚠️  Running in development with missing env vars. Check .env.example');
        }
    }

    // Warn about insecure defaults in production
    if (process.env.NODE_ENV === 'production') {
        if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
            console.error('❌ JWT_SECRET is too short. Use at least 32 characters in production.');
            process.exit(1);
        }
    }

    return {
        NODE_ENV: process.env.NODE_ENV || 'development',
        PORT: parseInt(process.env.PORT, 10) || 5002,
        MONGODB_URI: process.env.MONGODB_URI,
        JWT_SECRET: process.env.JWT_SECRET,
        JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
        CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
        TRUST_PROXY: process.env.TRUST_PROXY === 'true',
        RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
        RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX, 10) || 200,
    };
}

module.exports = validateEnv;
