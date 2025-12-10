const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mindbridge');

        const adminEmail = 'admin@mindbridge.in';
        const adminPassword = 'Admin@1231';

        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('Admin already exists');
        } else {
            const admin = new User({
                name: 'MindBridge Admin',
                email: adminEmail,
                password: adminPassword, // Will be hashed by pre-save hook
                role: 'admin',
                isEmailVerified: true,
                verificationStatus: 'approved'
            });

            await admin.save();
            console.log('Admin account created successfully');
        }

        mongoose.connection.close();
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
