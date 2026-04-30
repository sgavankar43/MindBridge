const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Transaction = require('../models/Transaction');
const AdminLog = require('../models/AdminLog');
const Notification = require('../models/Notification');

const getPagination = (query, defaultLimit = 20) => {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
    const skip = (page - 1) * limit;

    return { page, limit, skip };
};

const escapeRegex = (text) => {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

const sanitizeReason = (reason) => {
    if (!reason || typeof reason !== 'string') return '';
    return reason.trim().slice(0, 300);
};

const logAdminAction = async ({ req, action, targetType, targetId, reason = '', metadata = {} }) => {
    await AdminLog.create({
        admin: req.user._id,
        action,
        targetType,
        targetId,
        reason: sanitizeReason(reason),
        metadata
    });
};

const applyModerationStatusFilter = (filter, status) => {
    if (status === 'active') {
        filter.$or = [
            { moderationStatus: 'active' },
            { moderationStatus: { $exists: false } }
        ];
        return;
    }

    if (status !== 'all') {
        filter.moderationStatus = status;
    }
};

exports.getStats = async (req, res) => {
    try {
        const [
            totalAccounts,
            totalUsers,
            totalTherapists,
            totalAdmins,
            pendingTherapists,
            approvedTherapists,
            rejectedTherapists,
            totalPosts,
            totalComments,
            hiddenPosts,
            hiddenComments,
            totalTransactions,
            creditTotals
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: 'user' }),
            User.countDocuments({ role: 'therapist' }),
            User.countDocuments({ role: 'admin' }),
            User.countDocuments({ role: 'therapist', verificationStatus: 'pending' }),
            User.countDocuments({ role: 'therapist', verificationStatus: 'approved' }),
            User.countDocuments({ role: 'therapist', verificationStatus: 'rejected' }),
            Post.countDocuments(),
            Comment.countDocuments(),
            Post.countDocuments({ moderationStatus: 'hidden' }),
            Comment.countDocuments({ moderationStatus: 'hidden' }),
            Transaction.countDocuments(),
            Transaction.aggregate([
                { $match: { status: 'SUCCESS' } },
                {
                    $group: {
                        _id: '$type',
                        totalAmount: { $sum: '$amount' },
                        count: { $sum: 1 }
                    }
                }
            ])
        ]);

        const transactionSummary = creditTotals.reduce((summary, row) => {
            summary[row._id] = {
                amount: row.totalAmount,
                count: row.count
            };
            return summary;
        }, {});

        res.json({
            users: {
                total: totalAccounts,
                standard: totalUsers,
                therapists: totalTherapists,
                admins: totalAdmins
            },
            therapists: {
                pending: pendingTherapists,
                approved: approvedTherapists,
                rejected: rejectedTherapists
            },
            community: {
                posts: totalPosts,
                comments: totalComments,
                hiddenPosts,
                hiddenComments
            },
            wallet: {
                transactions: totalTransactions,
                creditPurchases: transactionSummary.CREDIT_PURCHASE || { amount: 0, count: 0 },
                therapyPayments: transactionSummary.THERAPY_PAYMENT || { amount: 0, count: 0 }
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching admin stats' });
    }
};

exports.getRecentActivity = async (req, res) => {
    try {
        const [users, posts, transactions] = await Promise.all([
            User.find()
                .select('name email role verificationStatus createdAt')
                .sort({ createdAt: -1 })
                .limit(5)
                .lean(),
            Post.find()
                .populate('author', 'name role')
                .select('content author createdAt')
                .sort({ createdAt: -1 })
                .limit(5)
                .lean(),
            Transaction.find()
                .populate('from', 'name role')
                .populate('to', 'name role')
                .select('from to amount type status createdAt')
                .sort({ createdAt: -1 })
                .limit(5)
                .lean()
        ]);

        res.json({ users, posts, transactions });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching recent activity' });
    }
};

exports.getPendingTherapists = async (req, res) => {
    try {
        const status = req.query.status || 'pending';

        if (!['pending', 'approved', 'rejected', 'none', 'all'].includes(status)) {
            return res.status(400).json({ message: 'Invalid verification status' });
        }

        const filter = { role: 'therapist' };
        if (status !== 'all') {
            filter.verificationStatus = status;
        }

        const pendingTherapists = await User.find(filter)
            .select('-password')
            .sort({ createdAt: -1 });

        res.json(pendingTherapists);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching pending therapists' });
    }
};

exports.verifyTherapist = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'approved' or 'rejected'
        const reason = sanitizeReason(req.body.reason);

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        if (status === 'rejected' && !reason) {
            return res.status(400).json({ message: 'Rejection reason is required' });
        }

        const user = await User.findByIdAndUpdate(
            id,
            {
                verificationStatus: status,
                verificationRejectionReason: status === 'rejected' ? reason : '',
                verificationReviewedBy: req.user._id,
                verificationReviewedAt: new Date()
            },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error updating verification status' });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const { page, limit, skip } = getPagination(req.query);
        const { query, role, verificationStatus } = req.query;
        const filter = {};

        if (query && typeof query === 'string' && query.trim()) {
            if (query.length > 100) {
                return res.status(400).json({ message: 'Search query too long' });
            }
            const escapedQuery = escapeRegex(query.trim());
            filter.$or = [
                { name: { $regex: escapedQuery, $options: 'i' } },
                { email: { $regex: escapedQuery, $options: 'i' } },
                { profession: { $regex: escapedQuery, $options: 'i' } }
            ];
        }

        if (role) {
            if (!['user', 'therapist', 'admin'].includes(role)) {
                return res.status(400).json({ message: 'Invalid role' });
            }
            filter.role = role;
        }

        if (verificationStatus) {
            if (!['pending', 'approved', 'rejected', 'none'].includes(verificationStatus)) {
                return res.status(400).json({ message: 'Invalid verification status' });
            }
            filter.verificationStatus = verificationStatus;
        }

        const [total, users] = await Promise.all([
            User.countDocuments(filter),
            User.find(filter)
                .select('-password')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean()
        ]);

        res.json({
            users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users' });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const allowedUpdates = {};
        const { role, verificationStatus, isEmailVerified, isPhoneVerified } = req.body;

        if (role !== undefined) {
            if (!['user', 'therapist', 'admin'].includes(role)) {
                return res.status(400).json({ message: 'Invalid role' });
            }
            allowedUpdates.role = role;
        }

        if (verificationStatus !== undefined) {
            if (!['pending', 'approved', 'rejected', 'none'].includes(verificationStatus)) {
                return res.status(400).json({ message: 'Invalid verification status' });
            }
            allowedUpdates.verificationStatus = verificationStatus;
        }

        if (isEmailVerified !== undefined) {
            allowedUpdates.isEmailVerified = Boolean(isEmailVerified);
        }

        if (isPhoneVerified !== undefined) {
            allowedUpdates.isPhoneVerified = Boolean(isPhoneVerified);
        }

        if (Object.keys(allowedUpdates).length === 0) {
            return res.status(400).json({ message: 'No supported updates provided' });
        }

        const user = await User.findByIdAndUpdate(id, allowedUpdates, {
            new: true,
            runValidators: true
        }).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await logAdminAction({
            req,
            action: `therapist.${status}`,
            targetType: 'therapist',
            targetId: user._id,
            reason
        });

        await Notification.create({
            recipient: user._id,
            title: status === 'approved' ? 'Therapist verification approved' : 'Therapist verification needs updates',
            message: status === 'approved'
                ? 'Your therapist profile has been approved. You can now use therapist features on MindBridge.'
                : `Your therapist verification was rejected. Reason: ${reason}`,
            type: 'verification',
            link: status === 'approved' ? '/dashboard' : '/verification-pending'
        });

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error updating user' });
    }
};

exports.getTransactions = async (req, res) => {
    try {
        const { page, limit, skip } = getPagination(req.query);
        const { type, status } = req.query;
        const filter = {};

        if (type) {
            if (!['CREDIT_PURCHASE', 'THERAPY_PAYMENT'].includes(type)) {
                return res.status(400).json({ message: 'Invalid transaction type' });
            }
            filter.type = type;
        }

        if (status) {
            if (!['SUCCESS', 'FAILED'].includes(status)) {
                return res.status(400).json({ message: 'Invalid transaction status' });
            }
            filter.status = status;
        }

        const [total, transactions] = await Promise.all([
            Transaction.countDocuments(filter),
            Transaction.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('from', 'name email role')
                .populate('to', 'name email role')
                .select('from to amount type status paymentIntentId createdAt')
                .lean()
        ]);

        res.json({
            transactions,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching transactions' });
    }
};

exports.getPosts = async (req, res) => {
    try {
        const { page, limit, skip } = getPagination(req.query);
        const { query, status = 'active' } = req.query;
        const filter = {};

        if (!['active', 'hidden', 'deleted', 'all'].includes(status)) {
            return res.status(400).json({ message: 'Invalid moderation status' });
        }

        applyModerationStatusFilter(filter, status);

        if (query && typeof query === 'string' && query.trim()) {
            if (query.length > 100) {
                return res.status(400).json({ message: 'Search query too long' });
            }
            filter.content = { $regex: escapeRegex(query.trim()), $options: 'i' };
        }

        const [total, posts] = await Promise.all([
            Post.countDocuments(filter),
            Post.find(filter)
                .populate('author', 'name email role')
                .populate('moderatedBy', 'name email role')
                .select('content image author likes comments hashtags moderationStatus moderationReason moderatedBy moderatedAt createdAt')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean()
        ]);

        res.json({
            posts,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching posts' });
    }
};

exports.moderatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, reason } = req.body;

        if (!['active', 'hidden', 'deleted'].includes(status)) {
            return res.status(400).json({ message: 'Invalid moderation status' });
        }

        const post = await Post.findByIdAndUpdate(
            id,
            {
                moderationStatus: status,
                moderationReason: status === 'active' ? '' : sanitizeReason(reason),
                moderatedBy: req.user._id,
                moderatedAt: new Date()
            },
            { new: true, runValidators: true }
        )
            .populate('author', 'name email role')
            .populate('moderatedBy', 'name email role')
            .select('content image author likes comments hashtags moderationStatus moderationReason moderatedBy moderatedAt createdAt');

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        await logAdminAction({
            req,
            action: `post.${status}`,
            targetType: 'post',
            targetId: post._id,
            reason,
            metadata: { previousRoute: 'moderatePost' }
        });

        res.json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error moderating post' });
    }
};

exports.deletePost = async (req, res) => {
    req.body = {
        ...req.body,
        status: 'deleted',
        reason: req.body?.reason || 'Deleted by admin'
    };
    return exports.moderatePost(req, res);
};

exports.getComments = async (req, res) => {
    try {
        const { page, limit, skip } = getPagination(req.query);
        const { query, status = 'active' } = req.query;
        const filter = {};

        if (!['active', 'hidden', 'deleted', 'all'].includes(status)) {
            return res.status(400).json({ message: 'Invalid moderation status' });
        }

        applyModerationStatusFilter(filter, status);

        if (query && typeof query === 'string' && query.trim()) {
            if (query.length > 100) {
                return res.status(400).json({ message: 'Search query too long' });
            }
            filter.content = { $regex: escapeRegex(query.trim()), $options: 'i' };
        }

        const [total, comments] = await Promise.all([
            Comment.countDocuments(filter),
            Comment.find(filter)
                .populate('author', 'name email role')
                .populate({
                    path: 'post',
                    select: 'content author createdAt',
                    populate: {
                        path: 'author',
                        select: 'name email role'
                    }
                })
                .populate('moderatedBy', 'name email role')
                .select('content author post likes moderationStatus moderationReason moderatedBy moderatedAt createdAt')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean()
        ]);

        res.json({
            comments,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching comments' });
    }
};

exports.moderateComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, reason } = req.body;

        if (!['active', 'hidden', 'deleted'].includes(status)) {
            return res.status(400).json({ message: 'Invalid moderation status' });
        }

        const comment = await Comment.findByIdAndUpdate(
            id,
            {
                moderationStatus: status,
                moderationReason: status === 'active' ? '' : sanitizeReason(reason),
                moderatedBy: req.user._id,
                moderatedAt: new Date()
            },
            { new: true, runValidators: true }
        )
            .populate('author', 'name email role')
            .populate({
                path: 'post',
                select: 'content author createdAt',
                populate: {
                    path: 'author',
                    select: 'name email role'
                }
            })
            .populate('moderatedBy', 'name email role')
            .select('content author post likes moderationStatus moderationReason moderatedBy moderatedAt createdAt');

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        await logAdminAction({
            req,
            action: `comment.${status}`,
            targetType: 'comment',
            targetId: comment._id,
            reason,
            metadata: { post: comment.post?._id }
        });

        res.json(comment);
    } catch (error) {
        res.status(500).json({ message: 'Error moderating comment' });
    }
};

exports.deleteComment = async (req, res) => {
    req.body = {
        ...req.body,
        status: 'deleted',
        reason: req.body?.reason || 'Deleted by admin'
    };
    return exports.moderateComment(req, res);
};

exports.getAdminLogs = async (req, res) => {
    try {
        const { page, limit, skip } = getPagination(req.query);
        const { targetType } = req.query;
        const filter = {};

        if (targetType) {
            if (!['post', 'comment', 'user', 'therapist', 'transaction'].includes(targetType)) {
                return res.status(400).json({ message: 'Invalid target type' });
            }
            filter.targetType = targetType;
        }

        const [total, logs] = await Promise.all([
            AdminLog.countDocuments(filter),
            AdminLog.find(filter)
                .populate('admin', 'name email role')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean()
        ]);

        res.json({
            logs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching admin logs' });
    }
};
