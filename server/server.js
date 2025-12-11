const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

console.log('🚀 Starting MindBridge Server...');

// Simple CORS setup - allow all origins for now
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', cors());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route first
app.get('/', (req, res) => {
    res.json({ message: 'MindBridge Server is running!' });
});

app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working!' });
});

// MongoDB connection
if (process.env.MONGODB_URI && process.env.MONGODB_URI !== 'mongodb+srv://username:password@cluster0.mongodb.net/mindbridge?retryWrites=true&w=majority') {
    console.log('🔄 Connecting to MongoDB...');
    mongoose.connect(process.env.MONGODB_URI)
        .then(() => {
            console.log('✅ Connected to MongoDB');
        })
        .catch((err) => {
            console.error('❌ MongoDB connection error:', err.message);
            console.log('⚠️  Server will continue without database');
        });
} else {
    console.log('⚠️  No valid MongoDB URI found - update your .env file');
    console.log('📝 Server running without database connection');
}

// Import and use routes
try {
    const authRoutes = require('./routes/auth');
    app.use('/api/auth', authRoutes);
    console.log('✅ Auth routes loaded');
} catch (error) {
    console.error('❌ Error loading auth routes:', error.message);
}

try {
    const userRoutes = require('./routes/users');
    app.use('/api/users', userRoutes);
    console.log('✅ User routes loaded');
} catch (error) {
    console.error('❌ Error loading user routes:', error.message);
}

try {
    const postRoutes = require('./routes/posts');
    app.use('/api/posts', postRoutes);
    console.log('✅ Post routes loaded');
} catch (error) {
    console.error('❌ Error loading post routes:', error.message);
}

try {
    const adminRoutes = require('./routes/admin');
    app.use('/api/admin', adminRoutes);
    console.log('✅ Admin routes loaded');
} catch (error) {
    console.error('❌ Error loading admin routes:', error.message);
}

try {
    const chatRoutes = require('./routes/chatRoutes');
    app.use('/api/chat', chatRoutes);
    console.log('✅ Chat routes loaded');
} catch (error) {
    console.error('❌ Error loading chat routes:', error.message);
}

try {
    const aiRoutes = require('./routes/aiRoutes');
    app.use('/api/ai', aiRoutes);
    console.log('✅ AI routes loaded');
} catch (error) {
    console.error('❌ Error loading AI routes:', error.message);
}

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Server is running',
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
        timestamp: new Date().toISOString()
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🔗 Test: http://localhost:${PORT}/api/test`);
    console.log(`❤️  Health: http://localhost:${PORT}/api/health`);
});

module.exports = app;