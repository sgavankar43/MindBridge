const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const mongoose = require('mongoose');

const escapeRegex = (text) => {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

exports.searchUsers = async (req, res) => {
    try {
        const {
            query,
            role,
            location,
            minFees,
            maxFees,
            language,
            page = 1,
            limit = 50
        } = req.query;

        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;

        let filter = {};

        // Keyword search
        if (query && typeof query === 'string') {
            const trimmedQuery = query.trim();
            if (trimmedQuery) {
                if (trimmedQuery.length > 100) {
                    return res.status(400).json({ message: 'Search query too long' });
                }
                const escapedQuery = escapeRegex(trimmedQuery);
                filter.$or = [
                    { name: { $regex: escapedQuery, $options: 'i' } },
                    { bio: { $regex: escapedQuery, $options: 'i' } },
                    { profession: { $regex: escapedQuery, $options: 'i' } }
                ];
            }
        }

        // Filters: Handle role and visibility
        const visibilityFilter = {
            $or: [
                { role: { $ne: 'therapist' } },
                { role: 'therapist', verificationStatus: 'approved' }
            ]
        };

        if (role) {
            const ALLOWED_ROLES = ['user', 'therapist'];
            if (!ALLOWED_ROLES.includes(role)) {
                return res.status(400).json({ message: 'Invalid role parameter' });
            }

            if (role === 'therapist') {
                filter.role = 'therapist';
                filter.verificationStatus = 'approved';
            } else {
                filter.role = role;
            }
        } else {
            // No specific role requested: apply visibility filter to hide unapproved therapists
            if (filter.$or) {
                filter = {
                    $and: [
                        filter,
                        visibilityFilter
                    ]
                };
            } else {
                Object.assign(filter, visibilityFilter);
            }
        }

        if (location && typeof location === 'string' && location.trim()) {
            if (location.length > 100) return res.status(400).json({ message: 'Location search too long' });
            filter.location = { $regex: escapeRegex(location.trim()), $options: 'i' };
        }

        if (language && typeof language === 'string' && language.trim()) {
            if (language.length > 100) return res.status(400).json({ message: 'Language search too long' });
            filter.languages = { $regex: escapeRegex(language.trim()), $options: 'i' };
        }

        if (minFees || maxFees) {
            filter.consultationFees = {};
            if (minFees) filter.consultationFees.$gte = Number(minFees);
            if (maxFees) filter.consultationFees.$lte = Number(maxFees);
        }

        const users = await User.find(filter)
            .select('-password')
            .skip(skip)
            .limit(limitNum)
            .lean();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error searching users' });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        const posts = await Post.find({ author: id }).sort({ createdAt: -1 });
        const comments = await Comment.find({ author: id }).populate('post').sort({ createdAt: -1 });

        res.json({ user, posts, comments });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile' });
    }
};

exports.toggleFollow = async (req, res) => {
    try {
        const targetUserId = req.params.id;
        const currentUserId = req.user._id;

        if (targetUserId === currentUserId.toString()) {
            return res.status(400).json({ message: 'Cannot follow yourself' });
        }

        const targetUser = await User.findById(targetUserId);
        const currentUser = await User.findById(currentUserId);

        if (!targetUser || !currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isFollowing = currentUser.following.includes(targetUserId);

        if (isFollowing) {
            // Unfollow
            currentUser.following.pull(targetUserId);
            targetUser.followers.pull(currentUserId);
        } else {
            // Follow
            currentUser.following.push(targetUserId);
            targetUser.followers.push(currentUserId);
        }

        await currentUser.save();
        await targetUser.save();

        res.json({
            isFollowing: !isFollowing,
            followersCount: targetUser.followers.length
        });
    } catch (error) {
        res.status(500).json({ message: 'Error toggling follow' });
    }
};

exports.getSuggestedUsers = async (req, res) => {
    try {
        if (!req.user || !mongoose.Types.ObjectId.isValid(req.user._id)) {
            return res.status(400).json({ message: 'Invalid user session' });
        }

        const excludeId = new mongoose.Types.ObjectId(req.user._id);

        const suggestions = await User.aggregate([
            {
                $match: {
                    _id: { $ne: excludeId },
                    $or: [
                        { role: { $ne: 'therapist' } },
                        { role: 'therapist', verificationStatus: 'approved' }
                    ]
                }
            },
            { $sample: { size: 3 } },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    avatar: 1,
                    bio: 1,
                    role: 1,
                    profession: 1
                }
            }
        ]);

        res.json(suggestions);
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        res.status(500).json({ message: 'Error fetching suggestions' });
    }
};

// Mental Health Profile Controllers

exports.getMentalHealthProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('mentalHealthProfile');
        res.json(user.mentalHealthProfile);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching mental health profile' });
    }
};

exports.updateMood = async (req, res) => {
    try {
        const { mood } = req.body;

        if (!mood || typeof mood !== 'string' || !mood.trim() || mood.length > 100) {
            return res.status(400).json({ message: 'Invalid mood' });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.mentalHealthProfile) {
            user.mentalHealthProfile = {};
        }
        user.mentalHealthProfile.currentMood = mood.trim();

        await user.save();
        res.json(user.mentalHealthProfile);
    } catch (error) {
        res.status(500).json({ message: 'Error updating mood' });
    }
};

exports.addGoal = async (req, res) => {
    try {
        const { text } = req.body;

        if (!text || typeof text !== 'string' || !text.trim()) {
            return res.status(400).json({ message: 'Goal text is required' });
        }

        const trimmedText = text.trim();
        if (trimmedText.length > 200) {
            return res.status(400).json({ message: 'Goal text cannot exceed 200 characters' });
        }

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!user.mentalHealthProfile) {
            user.mentalHealthProfile = { goals: [] };
        } else if (!Array.isArray(user.mentalHealthProfile.goals)) {
            user.mentalHealthProfile.goals = [];
        }

        const newGoal = {
            title: trimmedText,
            description: '',
            completed: false,
            createdAt: new Date()
        };

        user.mentalHealthProfile.goals.push(newGoal);
        await user.save();

        // Return the newly added goal (it will have an _id now)
        res.json(user.mentalHealthProfile.goals[user.mentalHealthProfile.goals.length - 1]);
    } catch (error) {
        res.status(500).json({ message: 'Error adding goal' });
    }
};

exports.toggleGoal = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid goal ID' });
        }

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!user.mentalHealthProfile || !Array.isArray(user.mentalHealthProfile.goals)) {
            return res.status(404).json({ message: 'Goal not found' });
        }

        const goal = user.mentalHealthProfile.goals.id(id);
        if (!goal) return res.status(404).json({ message: 'Goal not found' });

        goal.completed = !goal.completed;
        await user.save();

        res.json(goal);
    } catch (error) {
        res.status(500).json({ message: 'Error toggling goal' });
    }
};

exports.deleteGoal = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid goal ID' });
        }

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!user.mentalHealthProfile || !Array.isArray(user.mentalHealthProfile.goals)) {
            return res.status(404).json({ message: 'Goal not found' });
        }

        const goal = user.mentalHealthProfile.goals.id(id);
        if (!goal) {
            return res.status(404).json({ message: 'Goal not found' });
        }

        user.mentalHealthProfile.goals.pull(id);
        await user.save();

        res.json({ message: 'Goal deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting goal' });
    }
};

exports.updateStreak = async (req, res) => {
    try {
        const streakInput = req.body.streak;
        const streak = parseInt(streakInput, 10);

        if (isNaN(streak) || !Number.isInteger(streak) || streak < 0) {
            return res.status(400).json({ message: 'Streak must be a non-negative integer' });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.mentalHealthProfile) {
            user.mentalHealthProfile = { goals: [], longestStreak: 0 };
        }

        // Initialize longestStreak if it doesn't exist on the profile
        if (typeof user.mentalHealthProfile.longestStreak !== 'number') {
            user.mentalHealthProfile.longestStreak = 0;
        }

        if (streak > user.mentalHealthProfile.longestStreak) {
            user.mentalHealthProfile.longestStreak = streak;
        }
        user.mentalHealthProfile.streakCount = streak;
        user.mentalHealthProfile.lastUncheckDate = new Date(); // Track when it was last updated if needed

        await user.save();
        res.json({
            streakCount: user.mentalHealthProfile.streakCount,
            longestStreak: user.mentalHealthProfile.longestStreak
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating streak' });
    }
};

