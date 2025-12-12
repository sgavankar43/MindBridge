const User = require('../models/User');

exports.getPendingTherapists = async (req, res) => {
    try {
        const pendingTherapists = await User.find({
            role: 'therapist',
            verificationStatus: 'pending'
        }).select('-password');

        res.json(pendingTherapists);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching pending therapists' });
    }
};

exports.verifyTherapist = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'approved' or 'rejected'

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const user = await User.findByIdAndUpdate(
            id,
            { verificationStatus: status },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error updating verification status' });
    }
};
