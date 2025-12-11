const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ path: '../.env' }); // Adjust path if running from server/scripts

const seedUsers = async () => {
    try {
        console.log('Connecting to MongoDB...');
        // Try connecting using the env var, fallback to default local if needed but strict preference for Env
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            console.error('MONGODB_URI is not defined in environment variables.');
            process.exit(1);
        }

        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const users = [
            {
                name: "Dr. Sarah Mitchell",
                email: "sarah.mitchell@example.com",
                password: "password123",
                role: "therapist",
                profession: "Clinical Psychologist",
                verificationStatus: "approved",
                bio: "Experienced psychologist specializing in anxiety and depression. I believe in a holistic approach to mental health.",
                location: "New York, NY",
                consultationFees: 150,
                languages: ["English", "Spanish"]
            },
            {
                name: "Alex Thompson",
                email: "alex.thompson@example.com",
                password: "password123",
                role: "user",
                bio: "Just looking for a supportive community.",
                location: "Chicago, IL",
                mentalHealthProfile: {
                    currentMood: "okay",
                    goals: [{ title: "Meditate daily", description: "10 minutes of mindfulness" }]
                }
            },
            {
                name: "Emma Wilson",
                email: "emma.wilson@example.com",
                password: "password123",
                role: "therapist",
                profession: "Wellness Coach",
                verificationStatus: "approved",
                bio: "Helping you find balance in life through mindfulness and positive psychology.",
                location: "Los Angeles, CA",
                consultationFees: 120,
                languages: ["English"]
            },
            {
                name: "John Doe",
                email: "john.doe@example.com",
                password: "password123",
                role: "user",
                bio: "Here to learn and grow.",
                location: "Austin, TX"
            }
        ];

        console.log('Seeding users...');

        for (const userData of users) {
            // Check if user exists
            const existingUser = await User.findOne({ email: userData.email });
            if (existingUser) {
                console.log(`User ${userData.email} already exists. Skipping.`);
                continue;
            }

            // Create new user (pre-save hook will hash password)
            const user = new User(userData);
            await user.save();
            console.log(`Created user: ${user.name} (${user.role})`);
        }

        console.log('Seed completed successfully');
        process.exit(0);

    } catch (error) {
        console.error('Error seeding users:', error);
        process.exit(1);
    }
};

seedUsers();
