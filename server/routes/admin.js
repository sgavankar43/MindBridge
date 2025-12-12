const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// Middleware to check if user is admin
const isAdmin = authorize('admin');

// Get all pending therapists
router.get('/pending-therapists', authenticateToken, isAdmin, adminController.getPendingTherapists);

// Approve/Reject therapist
router.put('/therapist/:id/verify', authenticateToken, isAdmin, adminController.verifyTherapist);

module.exports = router;
