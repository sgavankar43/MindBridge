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
            language
        } = req.query;

        let filter = {};

        // Keyword search
        if (query && typeof query === 'string' && query.trim()) {
            if (query.length > 100) {
                return res.status(400).json({ message: 'Search query too long' });
            }
            const escapedQuery = escapeRegex(query.trim());
            filter.$or = [
                { name: { $regex: escapedQuery, $options: 'i' } },
                { bio: { $regex: escapedQuery, $options: 'i' } },
                { profession: { $regex: escapedQuery, $options: 'i' } }
            ];
        }

        // Filters: Handle role and visibility
        const visibilityFilter = {
            $or: [
                { role: { $ne: 'therapist' } },
                { role: 'therapist', verificationStatus: 'approved' }
            ]
        };

        if (role === 'therapist') {
            filter.role = 'therapist';
            filter.verificationStatus = 'approved';
        } else if (role) {
            filter.role = role;
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

        const users = await User.find(filter).select('-password');
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
        console.log('Fetching suggestions for user:', req.user?._id);
        // Ensure exclude ID is an ObjectId
        const excludeId = new mongoose.Types.ObjectId(req.user._id);

        // Simple suggestion logic: Get 3 random users who are not the current user
        // In a real app, this would use aggregation with $sample and exclude already followed users
        const suggestions = await User.aggregate([
            { $match: { _id: { $ne: excludeId } } }, // Exclude current user
            { $sample: { size: 3 } }, // Random 3
            { $project: { password: 0, verificationDocuments: 0 } } // Exclude sensitive fields
        ]);

        console.log('Suggestions found:', suggestions.length);
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
        const user = await User.findById(req.user._id);

        if (!user.mentalHealthProfile) {
            user.mentalHealthProfile = {};
        }
        user.mentalHealthProfile.currentMood = mood;

        await user.save();
        res.json(user.mentalHealthProfile);
    } catch (error) {
        res.status(500).json({ message: 'Error updating mood' });
    }
};

exports.addGoal = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ message: 'Goal text is required' });

        const user = await User.findById(req.user._id);

        if (!user.mentalHealthProfile) {
            user.mentalHealthProfile = { goals: [] };
        }

        const newGoal = {
            title: text,
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
        const user = await User.findById(req.user._id);

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
        const user = await User.findById(req.user._id);

        user.mentalHealthProfile.goals.pull(id);
        await user.save();

        res.json({ message: 'Goal deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting goal' });
    }
};

exports.updateStreak = async (req, res) => {
    try {
        // This accepts a direct streak update. 
        // Ideally, this should be calculated server-side based on activity, but for now we follow the user request.
        const { streak } = req.body;

        const user = await User.findById(req.user._id);

        if (streak > user.mentalHealthProfile.longestStreak) {
            user.mentalHealthProfile.longestStreak = streak;
        }
        user.mentalHealthProfile.streakCount = streak;

        await user.save();
        res.json({
            streakCount: user.mentalHealthProfile.streakCount,
            longestStreak: user.mentalHealthProfile.longestStreak
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating streak' });
    }
};

