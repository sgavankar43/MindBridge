const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const userController = require('../controllers/userController');
const { upload } = require('../config/cloudinary');

// Search users
router.get('/search', authenticateToken, userController.searchUsers);

// Get suggested users
router.get('/suggestions', authenticateToken, userController.getSuggestedUsers);

// Existing user therapist application
router.post('/therapist-application', authenticateToken, upload.array('documents', 5), userController.applyForTherapist);

// Therapist verification resubmission
router.post('/therapist-verification/resubmit', authenticateToken, upload.array('documents', 5), userController.resubmitTherapistVerification);

// Mental Health Routes
router.get('/mental-health', authenticateToken, userController.getMentalHealthProfile);
router.put('/mental-health/mood', authenticateToken, userController.updateMood);
router.post('/mental-health/goals', authenticateToken, userController.addGoal);
router.put('/mental-health/goals/:id', authenticateToken, userController.toggleGoal);
router.delete('/mental-health/goals/:id', authenticateToken, userController.deleteGoal);
router.put('/mental-health/streak', authenticateToken, userController.updateStreak);

// Get user profile (public info + posts + comments)
router.get('/:id/profile', authenticateToken, userController.getProfile);

// Follow/Unfollow
router.put('/:id/follow', authenticateToken, userController.toggleFollow);

module.exports = router;
