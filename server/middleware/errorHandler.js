'use strict';

/**
 * Global error handling middleware.
 *
 * Must be registered LAST in server.js (after all routes).
 * Catches errors forwarded via next(err).
 *
 * In production:  returns a safe, sanitised message — no stack traces.
 * In development: returns the full error detail for debugging.
 */

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

/**
 * Formats a Mongoose ValidationError into a flat array of field messages.
 */
function formatMongooseValidationError(err) {
    return Object.values(err.errors).map((e) => ({
        field: e.path,
        message: e.message,
    }));
}

/**
 * Main error handler — 4-argument signature required by Express.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    // Log the full error internally (never expose to client)
    if (!IS_PRODUCTION) {
        console.error('[ERROR]', err);
    } else {
        // Structured JSON log for production log aggregators
        console.error(JSON.stringify({
            level: 'error',
            message: err.message,
            statusCode: err.statusCode || 500,
            path: req.path,
            method: req.method,
            timestamp: new Date().toISOString(),
        }));
    }

    // --- Mongoose Validation Error ---
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: formatMongooseValidationError(err),
        });
    }

    // --- Mongoose CastError (invalid ObjectId) ---
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        return res.status(400).json({
            success: false,
            message: 'Invalid resource ID format',
        });
    }

    // --- Mongoose Duplicate Key ---
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0] || 'field';
        return res.status(409).json({
            success: false,
            message: `${field} already exists`,
        });
    }

    // --- JWT Errors ---
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Token expired' });
    }

    // --- CORS Error ---
    if (err.message && err.message.includes('Not allowed by CORS')) {
        return res.status(403).json({ success: false, message: 'CORS policy violation' });
    }

    // --- Explicit status codes set by controllers ---
    const statusCode = err.statusCode || err.status || 500;

    const response = {
        success: false,
        message: IS_PRODUCTION
            ? (statusCode < 500 ? err.message : 'Internal server error')
            : (err.message || 'Internal server error'),
    };

    // Attach stack trace only in development
    if (!IS_PRODUCTION && err.stack) {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
};

/**
 * 404 handler — place between routes and errorHandler in server.js.
 */
const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
};

module.exports = { errorHandler, notFoundHandler };
