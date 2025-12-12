const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const postController = require('../controllers/postController');
const { upload } = require('../config/cloudinary');

router.get('/', authenticateToken, postController.getPosts);
router.post('/', authenticateToken, upload.single('image'), postController.createPost);
router.put('/:id/like', authenticateToken, postController.toggleLike);

// Comments
router.get('/:id/comments', authenticateToken, postController.getComments);
router.post('/:id/comments', authenticateToken, postController.addComment);

module.exports = router;
