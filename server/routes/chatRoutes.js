const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.post('/send', chatController.sendMessage);
router.get('/messages/:userId', chatController.getMessages);
router.get('/conversations', chatController.getConversations);

module.exports = router;
