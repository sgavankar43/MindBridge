'use strict';

const mongoose = require('mongoose');

/**
 * Transaction model
 *
 * Covers two flows:
 *   CREDIT_PURCHASE — User buys credits via Stripe (from is null, to = buyer)
 *   THERAPY_PAYMENT — User pays a therapist from wallet balance (from = user, to = therapist)
 *
 * Documents are append-only (never mutated) — status is set once on creation.
 */

const TRANSACTION_TYPES = Object.freeze(['CREDIT_PURCHASE', 'THERAPY_PAYMENT']);
const TRANSACTION_STATUS = Object.freeze(['SUCCESS', 'FAILED']);

const transactionSchema = new mongoose.Schema(
    {
        /**
         * Sender.
         * - CREDIT_PURCHASE: null (Stripe is the source, not a user)
         * - THERAPY_PAYMENT: the patient's ObjectId
         */
        from: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },

        /**
         * Recipient.
         * - CREDIT_PURCHASE: the user who purchased credits
         * - THERAPY_PAYMENT: the therapist receiving payment
         */
        to: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Recipient (to) is required'],
            index: true,
        },

        /**
         * Amount in credits (THERAPY_PAYMENT) or in smallest currency unit — cents (CREDIT_PURCHASE).
         * For CREDIT_PURCHASE this represents credits added to the wallet.
         * For THERAPY_PAYMENT this represents credits deducted from the patient.
         */
        amount: {
            type: Number,
            required: [true, 'Amount is required'],
            min: [0, 'Amount cannot be negative'],
        },

        /**
         * Transaction type.
         * CREDIT_PURCHASE — triggered by a successful Stripe webhook.
         * THERAPY_PAYMENT — triggered when a user books/pays for a therapy session.
         */
        type: {
            type: String,
            enum: {
                values: TRANSACTION_TYPES,
                message: `type must be one of: ${TRANSACTION_TYPES.join(', ')}`,
            },
            required: [true, 'Transaction type is required'],
            index: true,
        },

        /**
         * Outcome of the transaction.
         */
        status: {
            type: String,
            enum: {
                values: TRANSACTION_STATUS,
                message: `status must be one of: ${TRANSACTION_STATUS.join(', ')}`,
            },
            required: [true, 'Status is required'],
            default: 'SUCCESS',
        },

        /**
         * Stripe Payment Intent ID.
         * Populated for CREDIT_PURCHASE transactions.
         * Null for internal wallet-to-wallet THERAPY_PAYMENT transactions.
         * Also used for idempotency — unique sparse index prevents double-processing.
         */
        paymentIntentId: {
            type: String,
            sparse: true,   // Only index non-null values (therapy payments have no intent)
            unique: true,   // One transaction per Stripe payment intent
        },
    },
    {
        timestamps: true,   // adds createdAt, updatedAt automatically
        versionKey: false,  // cleaner documents without __v
    }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

// Query: "all transactions involving this user (as sender or receiver)"
transactionSchema.index({ from: 1, createdAt: -1 });
transactionSchema.index({ to: 1, createdAt: -1 });

// Query: "transaction history filtered by type"
transactionSchema.index({ type: 1, status: 1 });

// ─── Static helpers ───────────────────────────────────────────────────────────

/**
 * Fetch the transaction history for a given user (as sender or receiver).
 * @param {ObjectId|string} userId
 * @param {number} limit
 */
transactionSchema.statics.historyForUser = function (userId, limit = 20) {
    return this.find({ $or: [{ from: userId }, { to: userId }] })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('from', 'name avatar role')
        .populate('to', 'name avatar role')
        .lean();
};

// ─── Exported constants ───────────────────────────────────────────────────────

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
module.exports.TRANSACTION_TYPES = TRANSACTION_TYPES;
module.exports.TRANSACTION_STATUS = TRANSACTION_STATUS;
