const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// Middleware to check if user is admin
const isAdmin = authorize('admin');

// Dashboard overview
router.get('/stats', authenticateToken, isAdmin, adminController.getStats);
router.get('/recent-activity', authenticateToken, isAdmin, adminController.getRecentActivity);
router.get('/logs', authenticateToken, isAdmin, adminController.getAdminLogs);

// Community moderation
router.get('/posts', authenticateToken, isAdmin, adminController.getPosts);
router.patch('/posts/:id/moderation', authenticateToken, isAdmin, adminController.moderatePost);
router.delete('/posts/:id', authenticateToken, isAdmin, adminController.deletePost);
router.get('/comments', authenticateToken, isAdmin, adminController.getComments);
router.patch('/comments/:id/moderation', authenticateToken, isAdmin, adminController.moderateComment);
router.delete('/comments/:id', authenticateToken, isAdmin, adminController.deleteComment);

// User management
router.get('/users', authenticateToken, isAdmin, adminController.getUsers);
router.patch('/users/:id', authenticateToken, isAdmin, adminController.updateUser);

// Get all pending therapists
router.get('/pending-therapists', authenticateToken, isAdmin, adminController.getPendingTherapists);

// Approve/Reject therapist
router.put('/therapist/:id/verify', authenticateToken, isAdmin, adminController.verifyTherapist);

// Wallet audit
router.get('/transactions', authenticateToken, isAdmin, adminController.getTransactions);

module.exports = router;
