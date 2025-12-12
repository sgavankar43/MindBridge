const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const userController = require('../controllers/userController');

// Search users
router.get('/search', authenticateToken, userController.searchUsers);

// Get user profile (public info + posts + comments)
router.get('/:id/profile', authenticateToken, userController.getProfile);

// Follow/Unfollow
router.put('/:id/follow', authenticateToken, userController.toggleFollow);

module.exports = router;
