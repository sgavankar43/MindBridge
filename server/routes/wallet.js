'use strict';

const express = require('express');
const router = express.Router();

const { authenticateToken } = require('../middleware/auth');
const { strictLimiter } = require('../middleware/rateLimiter');
const walletController = require('../controllers/walletController');

// ─── Authenticated wallet routes ─────────────────────────────────────────────

/**
 * GET /api/wallet/balance
 * Returns the user's current wallet balance.
 * Response: { success, data: { walletBalance } }
 */
router.get('/balance', authenticateToken, walletController.getWalletBalance);

/**
 * GET /api/wallet/transactions
 * Returns the user's transaction history, latest first.
 * Query: ?page=1&limit=20 (limit capped at 100)
 * Response: { success, data: { transactions[], pagination: { page, limit, total, totalPages } } }
 */
router.get('/transactions', authenticateToken, walletController.getTransactions);

/**
 * POST /api/wallet/create-checkout-session
 * Creates a Stripe Checkout session and returns the redirect URL.
 * Body: { creditAmount: 100 | 250 | 500 | 1000 }
 *
 * strictLimiter: max 5 requests per 15 min — prevents session-creation abuse.
 */
router.post(
    '/create-checkout-session',
    strictLimiter,
    authenticateToken,
    walletController.createCheckoutSession
);

// ─── Stripe webhook (unauthenticated, raw body required) ─────────────────────
//
// NOTE: This route needs the raw request body for signature verification.
//       In server.js, register express.raw() for this path BEFORE express.json().
//       The route is mounted on /api/wallet, so the full path is /api/wallet/webhook.

/**
 * POST /api/wallet/webhook
 * Stripe calls this directly — no JWT auth, but signature-verified.
 */
router.post('/webhook', walletController.handleWebhook);

// ─── Transfer route ───────────────────────────────────────────────────────────

/**
 * POST /api/wallet/transfer
 * Transfer credits from the authenticated user to a therapist.
 * Body: { toUserId: string, amount: number }
 *
 * strictLimiter: max 5 requests per 15 min — prevents abuse of transfer endpoint.
 */
router.post(
    '/transfer',
    strictLimiter,
    authenticateToken,
    walletController.transferToTherapist
);

module.exports = router;
