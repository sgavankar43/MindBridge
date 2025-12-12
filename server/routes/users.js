const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const userController = require('../controllers/userController');

// Search users
router.get('/search', authenticateToken, userController.searchUsers);

// Get suggested users
router.get('/suggestions', authenticateToken, userController.getSuggestedUsers);

// Get user profile (public info + posts + comments)
router.get('/:id/profile', authenticateToken, userController.getProfile);

// Follow/Unfollow
router.put('/:id/follow', authenticateToken, userController.toggleFollow);

// Mental Health Routes
router.get('/mental-health', authenticateToken, userController.getMentalHealthProfile);
router.put('/mental-health/mood', authenticateToken, userController.updateMood);
router.post('/mental-health/goals', authenticateToken, userController.addGoal);
router.put('/mental-health/goals/:id', authenticateToken, userController.toggleGoal);
router.delete('/mental-health/goals/:id', authenticateToken, userController.deleteGoal);
router.put('/mental-health/streak', authenticateToken, userController.updateStreak);

module.exports = router;
