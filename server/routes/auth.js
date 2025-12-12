const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const authController = require('../controllers/authController');
const { upload } = require('../config/cloudinary');

router.get('/test', (req, res) => {
    console.log('✅ Auth test route hit');
    res.json({ message: 'Auth routes working!' });
});

router.post('/register', upload.array('documents', 5), authController.register);
router.post('/login', authController.login);
router.get('/me', authenticateToken, authController.getMe);
router.post('/logout', authenticateToken, authController.logout);

module.exports = router;
