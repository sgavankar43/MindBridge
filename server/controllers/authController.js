const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { upload } = require('../config/cloudinary');

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

exports.register = async (req, res) => {
    try {
        console.log('📝 Registration attempt:', req.body);
        const {
            name, email, password, role, profession, bio,
            location, consultationFees, languages
        } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'Name, email, and password are required'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: 'User with this email already exists'
            });
        }

        const verificationDocuments = [];
        if (req.files) {
            req.files.forEach(file => {
                verificationDocuments.push(file.path || file.url);
            });
        }

        // Determine verification status
        let verificationStatus = 'none';
        if (role === 'therapist') {
            verificationStatus = 'pending';
        }

        // Create new user
        const user = new User({
            name,
            email,
            password,
            role: role || 'user',
            profession: profession || null,
            bio: bio || '',
            location: location || null,
            consultationFees: consultationFees ? Number(consultationFees) : null,
            languages: languages ? (Array.isArray(languages) ? languages : JSON.parse(languages)) : [],
            verificationStatus,
            verificationDocuments
        });

        await user.save();
        console.log('✅ User created successfully:', user.email);

        // Generate token
        const token = generateToken(user._id);

        // Return user data (excluding password)
        const userData = user.getPublicProfile();

        res.status(201).json({
            message: 'Registration successful',
            token,
            user: userData
        });
    } catch (error) {
        console.error('❌ Registration error:', error);

        if (error.code === 11000) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: messages.join(', ') });
        }

        res.status(500).json({ message: 'Registration failed' });
    }
};

exports.login = async (req, res) => {
    try {
        console.log('🔐 Login attempt:', req.body.email);
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and password are required'
            });
        }

        // Find user and include password for comparison
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        // Check verification status for therapists
        if (user.role === 'therapist' && user.verificationStatus !== 'approved') {
            return res.status(403).json({
                message: `Your account status is ${user.verificationStatus}. Please wait for admin approval.`,
                verificationStatus: user.verificationStatus
            });
        }

        // Update last login
        await user.updateLastLogin();
        console.log('✅ User logged in successfully:', user.email);

        // Generate token
        const token = generateToken(user._id);

        // Return user data (excluding password)
        const userData = user.getPublicProfile();

        res.json({
            message: 'Login successful',
            token,
            user: userData
        });
    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({ message: 'Login failed' });
    }
};

exports.getMe = async (req, res) => {
    try {
        const userData = req.user.getPublicProfile();
        res.json({ user: userData });
    } catch (error) {
        console.error('❌ Get user error:', error);
        res.status(500).json({ message: 'Failed to get user data' });
    }
};

exports.logout = async (req, res) => {
    try {
        // In JWT, logout is mainly handled client-side by removing the token
        // But we can log it for analytics
        console.log('👋 User logged out:', req.user._id);
        res.json({ message: 'Logout successful' });
    } catch (error) {
        console.error('❌ Logout error:', error);
        res.status(500).json({ message: 'Logout failed' });
    }
};
