const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken'); // Import JWT for socket auth
require('dotenv').config();

const app = express();
const server = http.createServer(app);

console.log('🚀 Starting MindBridge Server...');

// CORS Configuration - Production Ready
const allowedOrigins = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(',').map(url => url.trim())
    : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // In development, allow all origins
        if (process.env.NODE_ENV === 'development') {
            return callback(null, true);
        }

        // In production, check against allowed origins
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
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
    const aiRoutes = require('./routes/ai');
    app.use('/api/ai', aiRoutes);
    console.log('✅ AI routes loaded');
} catch (error) {
    console.error('❌ Error loading AI routes:', error.message);
}

try {
    const messageRoutes = require('./routes/messages');
    app.use('/api/messages', messageRoutes);
    console.log('✅ Message routes loaded');
} catch (error) {
    console.error('❌ Error loading message routes:', error.message);
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

// Socket.io setup with production-ready CORS
const io = new Server(server, {
    cors: {
        origin: process.env.NODE_ENV === 'development'
            ? true
            : allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Store socket instances for easy access in routes if needed
app.set('io', io);

// Socket middleware for authentication
io.use((socket, next) => {
    // Check for token in handshake auth object or headers
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
        return next(new Error("Authentication error: No token provided"));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded; // Attach user data to socket
        next();
    } catch (err) {
        return next(new Error("Authentication error: Invalid token"));
    }
});

// Socket connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id, 'User ID:', socket.user.userId);

    // Automatically join the user's room based on their authenticated ID
    // We use socket.user.userId from the JWT payload
    if (socket.user && socket.user.userId) {
        socket.join(socket.user.userId);
        console.log(`User ${socket.user.userId} joined their room`);
    }

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const serverUrl =
    process.env.NODE_ENV === 'production'
        ? `port ${PORT}`
        : `http://localhost:${PORT}`;

server.listen(PORT, () => {
    console.log(`🚀 Server running on ${serverUrl}`);
    console.log(`🔗 Test: ${process.env.NODE_ENV === 'production' ? '' : 'http://localhost:' + PORT}/api/test`);
    console.log(`❤️  Health: ${process.env.NODE_ENV === 'production' ? '' : 'http://localhost:' + PORT}/api/health`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});

module.exports = { app, io };