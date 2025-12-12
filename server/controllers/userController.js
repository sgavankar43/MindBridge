const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

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
        if (query) {
            filter.$or = [
                { name: { $regex: query, $options: 'i' } },
                { bio: { $regex: query, $options: 'i' } },
                { profession: { $regex: query, $options: 'i' } }
            ];
        }

        // Filters
        if (role) {
            filter.role = role;
            // If searching for therapists, they must be approved
            if (role === 'therapist') {
                filter.verificationStatus = 'approved';
            }
        } else {
            // General search: if a user is a therapist, they must be approved to show up
            // Users with other roles (like 'user') are shown
            filter.$or = [
                { role: { $ne: 'therapist' } },
                { role: 'therapist', verificationStatus: 'approved' }
            ];
            // Re-apply query filter if it exists inside the $or for role logic?
            // Actually, mongodb $or at top level for query vs role logic can be tricky.
            // Let's structure it carefully.

            // Simplified approach: Always hide unapproved therapists
            // We use $and to combine the implicit AND of 'filter' object with our logic

            // Current 'filter' contains query, location, etc.
            // We want to add a condition: (role != therapist OR (role == therapist AND status == approved))
        }

        // Apply mandatory filter: Hide pending/rejected therapists
        // This effectively modifies the query to exclude unapproved therapists
        // regardless of other filters
        const visibilityFilter = {
            $or: [
                { role: { $ne: 'therapist' } },
                { role: 'therapist', verificationStatus: 'approved' }
            ]
        };

        // If we already have a filter.role, we don't need the complex $or
        // We just add verificationStatus = 'approved' if role is therapist

        if (role === 'therapist') {
            filter.verificationStatus = 'approved';
        } else if (!role) {
             // If no specific role requested, apply the visibility filter
             // We need to merge this with existing 'filter'
             // If filter has $or (from query), we need to be careful using $and
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

        if (location) filter.location = { $regex: location, $options: 'i' };
        if (language) filter.languages = { $regex: language, $options: 'i' };

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
