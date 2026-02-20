'use strict';

const Stripe = require('stripe');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { TRANSACTION_TYPES } = require('../models/Transaction');

// Lazy-init stripe so the module can be required without crashing if the key
// is not set (e.g. during unit tests or cold-start validation).
let _stripe = null;
function getStripe() {
    if (!_stripe) {
        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error('STRIPE_SECRET_KEY is not configured');
        }
        _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2024-06-20', // Pin to a specific API version
        });
    }
    return _stripe;
}

// ─── Credit package definitions ──────────────────────────────────────────────
//
// Prices are in smallest currency unit (cents/pence).
// Feel free to expand or pull these from a DB in the future.
//
const CREDIT_PACKAGES = {
    100: { credits: 100, amount: 499, currency: 'usd', label: '100 Credits' },
    250: { credits: 250, amount: 999, currency: 'usd', label: '250 Credits' },
    500: { credits: 500, amount: 1799, currency: 'usd', label: '500 Credits' },
    1000: { credits: 1000, amount: 2999, currency: 'usd', label: '1000 Credits' },
};

// ─── POST /api/wallet/create-checkout-session ─────────────────────────────────

/**
 * Creates a Stripe Checkout session and returns the session URL.
 * The frontend redirects the user to that URL to complete payment.
 *
 * Body: { creditAmount: 100 | 250 | 500 | 1000 }
 */
exports.createCheckoutSession = async (req, res, next) => {
    try {
        const stripe = getStripe();

        const rawAmount = parseInt(req.body.creditAmount, 10);
        const pkg = CREDIT_PACKAGES[rawAmount];

        if (!pkg) {
            return res.status(400).json({
                success: false,
                message: `Invalid credit amount. Allowed values: ${Object.keys(CREDIT_PACKAGES).join(', ')}`,
            });
        }

        const userId = req.user._id.toString();

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: [
                {
                    price_data: {
                        currency: pkg.currency,
                        unit_amount: pkg.amount,
                        product_data: {
                            name: pkg.label,
                            description: `Add ${pkg.credits} credits to your MindBridge wallet`,
                        },
                    },
                    quantity: 1,
                },
            ],
            // Pass user ID + credit amount so the webhook can retrieve them
            metadata: {
                userId,
                credits: pkg.credits.toString(),
                packageLabel: pkg.label,
            },
            // Use env-configured URLs with a fallback for development
            success_url: `${process.env.CLIENT_URL}/wallet?status=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/wallet?status=cancelled`,
            // Pre-fill the customer email if we have it
            customer_email: req.user.email,
        });

        res.status(200).json({
            success: true,
            url: session.url,
            sessionId: session.id,
        });
    } catch (err) {
        next(err);
    }
};

// ─── POST /api/wallet/webhook ─────────────────────────────────────────────────

/**
 * Stripe webhook endpoint — MUST use raw body (not JSON-parsed).
 * Registered in server.js BEFORE express.json() for this route.
 *
 * Flow:
 *   1. Verify Stripe signature
 *   2. Handle checkout.session.completed
 *   3. Check for existing Transaction (idempotency)
 *   4. Credit user wallet + create Transaction record atomically
 */
exports.handleWebhook = async (req, res) => {
    const mongoose = require('mongoose');
    const stripe = getStripe();
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    console.log('[Webhook] Received webhook request');
    console.log('[Webhook] Headers:', JSON.stringify({ 'stripe-signature': sig ? 'present' : 'missing', 'content-type': req.headers['content-type'] }));
    console.log('[Webhook] Body type:', typeof req.body, 'Is Buffer:', Buffer.isBuffer(req.body));

    if (!webhookSecret) {
        console.error('[Webhook] STRIPE_WEBHOOK_SECRET is not set');
        return res.status(500).json({ received: false });
    }

    let event;
    try {
        // req.body must be the raw Buffer here (see server.js for setup)
        if (!Buffer.isBuffer(req.body)) {
            console.error('[Webhook] req.body is NOT a Buffer. Check server.js middleware order.');
            // We'll still try to construct it, but it will likely fail if it's already parsed as JSON
        }
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        console.log('[Webhook] Event verified:', event.type);
    } catch (err) {
        // Signature verification failed — log details internally
        console.error('[Webhook] Signature verification failed:', err.message);
        console.error('[Webhook] Error stack:', err.stack);
        return res.status(400).json({ received: false, error: err.message });
    }

    // Only handle the event we care about
    if (event.type !== 'checkout.session.completed') {
        console.log('[Webhook] Ignoring event type:', event.type);
        return res.status(200).json({ received: true, handled: false });
    }

    const session = event.data.object;
    console.log('[Webhook] Session data:', JSON.stringify(session.metadata));

    // Populate metadata set during checkout session creation
    const userId = session.metadata?.userId;
    const credits = parseInt(session.metadata?.credits, 10);
    const paymentIntentId = session.payment_intent ?? null;
    const sessionId = session.id;

    console.log(`[Webhook] Processing session ${sessionId} for user ${userId} (${credits} credits). PaymentIntent: ${paymentIntentId}`);

    // Validate metadata is intact
    if (!userId || !credits || isNaN(credits)) {
        console.error('[Webhook] Missing or invalid metadata on session:', sessionId);
        return res.status(200).json({ received: true, handled: false, reason: 'bad_metadata' });
    }

    const dbSession = await mongoose.startSession();

    try {
        let result = { handled: false };

        await dbSession.withTransaction(async () => {
            // ── Idempotency check ──────────────────────────────────────────────
            if (paymentIntentId) {
                const existing = await Transaction.findOne({ paymentIntentId }).session(dbSession);
                if (existing) {
                    console.log('[Webhook] Duplicate webhook ignored. paymentIntentId:', paymentIntentId);
                    result = { handled: true, reason: 'duplicate' };
                    return;
                }
            }

            // ── Credit wallet ──────────────────────────────────────────────────
            console.log('[Webhook] Updating user balance for userId:', userId);
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                { $inc: { walletBalance: credits } },
                { session: dbSession, new: true, runValidators: false }
            );

            if (!updatedUser) {
                console.error('[Webhook] User not found for userId:', userId);
                result = { handled: false, reason: 'user_not_found' };
                throw new Error('user_not_found');
            }

            // ── Record transaction ─────────────────────────────────────────────
            console.log('[Webhook] Creating transaction record');
            await Transaction.create(
                [{
                    from: null,
                    to: userId,
                    amount: credits,
                    type: 'CREDIT_PURCHASE',
                    status: 'SUCCESS',
                    paymentIntentId: paymentIntentId,
                }],
                { session: dbSession }
            );

            console.log(`[Webhook] SUCCESS: Credited ${credits} to user ${userId}. New balance: ${updatedUser.walletBalance}`);
            result = { handled: true };
        });

        return res.status(200).json({ received: true, ...result });

    } catch (err) {
        if (err.message === 'user_not_found') {
            return res.status(200).json({ received: true, handled: false, reason: 'user_not_found' });
        }
        // Log the full error internally; return 500 so Stripe retries
        console.error('[Webhook] Error processing event:', err.message);
        return res.status(500).json({ received: false });
    } finally {
        dbSession.endSession();
        console.log('[Webhook] Database session closed');
    }
};

// ─── GET /api/wallet/balance ─────────────────────────────────────────────────

/**
 * Returns the authenticated user's current wallet balance.
 *
 * Response:
 *   { success, data: { walletBalance } }
 */
exports.getWalletBalance = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select('walletBalance').lean();
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        return res.status(200).json({
            success: true,
            data: {
                walletBalance: user.walletBalance,
            },
        });
    } catch (err) {
        next(err);
    }
};

// ─── GET /api/wallet/transactions ────────────────────────────────────────────

/**
 * Returns the authenticated user's transaction history (as sender or receiver).
 *
 * Query params:
 *   page  (default 1)  — page number
 *   limit (default 20) — records per page, max 100
 *
 * Response:
 *   { success, data: { transactions[], pagination: { page, limit, total, totalPages } } }
 */
exports.getTransactions = async (req, res, next) => {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
        const skip = (page - 1) * limit;

        const filter = { $or: [{ from: req.user._id }, { to: req.user._id }] };

        // Run count and data fetch in parallel for efficiency
        const [total, transactions] = await Promise.all([
            Transaction.countDocuments(filter),
            Transaction.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('from', 'name avatar role')
                .populate('to', 'name avatar role')
                .select('from to amount type status paymentIntentId createdAt')
                .lean(),
        ]);

        return res.status(200).json({
            success: true,
            data: {
                transactions,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            },
        });
    } catch (err) {
        next(err);
    }
};

// ─── POST /api/wallet/transfer ────────────────────────────────────────────────

/**
 * Transfer credits from the authenticated user to a therapist.
 *
 * Body: { toUserId: string, amount: number }
 *
 * Guards (checked before opening session for fast failure):
 *   - amount must be > 0 and finite
 *   - no self-transfer
 *   - recipient must exist and have role 'therapist'
 *
 * Inside the MongoDB session (atomic):
 *   - Re-fetches sender balance to prevent TOCTOU race conditions
 *   - Validates sufficient balance
 *   - Debits sender via $inc (atomic)
 *   - Credits therapist via $inc (atomic)
 *   - Creates THERAPY_PAYMENT Transaction record
 *   - On any failure the session aborts — no partial state possible
 */
exports.transferToTherapist = async (req, res, next) => {
    const mongoose = require('mongoose');

    const senderId = req.user._id;
    const { toUserId, amount: rawAmount } = req.body;

    // ── Fast validation (no DB hit) ───────────────────────────────────────────

    const amount = Number(rawAmount);

    if (!toUserId) {
        return res.status(400).json({ success: false, message: 'toUserId is required' });
    }
    if (!amount || amount <= 0 || !Number.isFinite(amount)) {
        return res.status(400).json({ success: false, message: 'amount must be a positive number' });
    }
    if (senderId.toString() === toUserId.toString()) {
        return res.status(400).json({ success: false, message: 'You cannot transfer credits to yourself' });
    }

    // ── Validate recipient (outside session — read-only check) ────────────────

    const recipient = await User.findById(toUserId).select('_id role name').lean();
    if (!recipient) {
        return res.status(404).json({ success: false, message: 'Recipient not found' });
    }
    if (recipient.role !== 'therapist') {
        return res.status(403).json({ success: false, message: 'Credits can only be transferred to a verified therapist' });
    }

    // ── Atomic MongoDB session ────────────────────────────────────────────────

    const session = await mongoose.startSession();

    try {
        let newTransaction;

        await session.withTransaction(async () => {
            // Re-fetch sender balance INSIDE the session — prevents TOCTOU bugs
            // on concurrent transfers draining the same balance.
            const sender = await User.findById(senderId)
                .select('walletBalance')
                .session(session)
                .lean();

            if (!sender) {
                const err = new Error('Sender account not found');
                err.statusCode = 404;
                throw err;
            }
            if (sender.walletBalance < amount) {
                const err = new Error(`Insufficient balance. Available: ${sender.walletBalance} credits`);
                err.statusCode = 400;
                throw err;
            }

            // Debit sender (atomic $inc — never sets balance below 0 at app level)
            await User.findByIdAndUpdate(
                senderId,
                { $inc: { walletBalance: -amount } },
                { session, runValidators: false, new: false }
            );

            // Credit therapist (atomic $inc)
            await User.findByIdAndUpdate(
                toUserId,
                { $inc: { walletBalance: amount } },
                { session, runValidators: false, new: false }
            );

            // Create the immutable transaction record
            // Transaction.create with an array + session is required for Mongoose session support
            const [created] = await Transaction.create(
                [
                    {
                        from: senderId,
                        to: toUserId,
                        amount,
                        type: 'THERAPY_PAYMENT',
                        status: 'SUCCESS',
                        // Omit paymentIntentId for internal transfers to avoid unique index conflicts
                    },
                ],
                { session }
            );

            newTransaction = created;
        });

        // Populate for the response (outside session — lightweight read)
        await newTransaction.populate([
            { path: 'from', select: 'name avatar role' },
            { path: 'to', select: 'name avatar role' },
        ]);

        return res.status(200).json({
            success: true,
            message: `Successfully transferred ${amount} credits to ${recipient.name}`,
            transaction: newTransaction,
        });

    } catch (err) {
        // Surface validation errors from within the session with their status codes
        if (err.statusCode) {
            return res.status(err.statusCode).json({ success: false, message: err.message });
        }
        next(err);
    } finally {
        // Always release the session — even if withTransaction threw
        session.endSession();
    }
};
