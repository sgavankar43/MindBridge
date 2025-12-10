const express = require('express');
const router = express.Router();

// Test route
router.get('/test', (req, res) => {
    console.log('✅ Users test route hit');
    res.json({ message: 'Users routes working!' });
});

module.exports = router;