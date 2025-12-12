const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    // Basic Information
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false // Don't include password in queries by default
    },

    // Profile Information
    avatar: {
        type: String,
        default: null
    },
    bio: {
        type: String,
        maxlength: [500, 'Bio cannot exceed 500 characters'],
        default: ''
    },
    phone: {
        type: String,
        default: null
    },

    // Professional Information
    role: {
        type: String,
        enum: ['user', 'therapist', 'admin'],
        default: 'user'
    },
    profession: {
        type: String,
        default: null
    },
    specializations: [{
        type: String
    }],

    // Therapist Verification
    verificationStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'none'],
        default: 'none'
    },
    verificationDocuments: [{
        type: String // URLs to uploaded documents
    }],
    licenseNumber: {
        type: String,
        default: null
    },

    // Searchable Fields
    location: {
        type: String,
        trim: true,
        default: null
    },
    consultationFees: {
        type: Number,
        default: null
    },
    languages: [{
        type: String,
        trim: true
    }],

    // Social
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

    // Account Settings
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    isPhoneVerified: {
        type: Boolean,
        default: false
    },
    profileVisibility: {
        type: String,
        enum: ['public', 'private', 'friends'],
        default: 'public'
    },

    // Security
    twoFactorEnabled: {
        type: Boolean,
        default: false
    },
    lastLogin: {
        type: Date,
        default: null
    },

    // Preferences
    preferences: {
        theme: {
            type: String,
            enum: ['light', 'dark', 'system'],
            default: 'light'
        },
        language: {
            type: String,
            default: 'english'
        },
        notifications: {
            email: { type: Boolean, default: true },
            push: { type: Boolean, default: true },
            sound: { type: Boolean, default: true },
            community: { type: Boolean, default: true },
            aiChat: { type: Boolean, default: true },
            reminders: { type: Boolean, default: true }
        },
        privacy: {
            showOnlineStatus: { type: Boolean, default: true },
            allowDirectMessages: { type: Boolean, default: true },
            showActivity: { type: Boolean, default: false }
        }
    },

    // Mental Health Data
    mentalHealthProfile: {
        currentMood: {
            type: String,
            enum: ['great', 'good', 'okay', 'bad', 'terrible'],
            default: 'good'
        },
        goals: [{
            title: String,
            description: String,
            completed: { type: Boolean, default: false },
            createdAt: { type: Date, default: Date.now }
        }],
        streakCount: {
            type: Number,
            default: 0
        },
        longestStreak: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Update last login
userSchema.methods.updateLastLogin = function () {
    this.lastLogin = new Date();
    return this.save();
};

// Get public profile (exclude sensitive data)
userSchema.methods.getPublicProfile = function () {
    const userObject = this.toObject();
    delete userObject.password;
    delete userObject.twoFactorEnabled;
    delete userObject.preferences;
    return userObject;
};

module.exports = mongoose.model('User', userSchema);