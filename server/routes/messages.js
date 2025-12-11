const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const mongoose = require('mongoose');

// Get list of conversations (users the current user has chatted with)
router.get('/conversations', authenticateToken, async (req, res) => {
    try {
        const userId = req.user._id;

        // Aggregate to find unique users and the last message
        const conversations = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { sender: new mongoose.Types.ObjectId(userId) },
                        { recipient: new mongoose.Types.ObjectId(userId) }
                    ]
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ["$sender", new mongoose.Types.ObjectId(userId)] },
                            "$recipient",
                            "$sender"
                        ]
                    },
                    lastMessage: { $first: "$$ROOT" },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$recipient", new mongoose.Types.ObjectId(userId)] },
                                        { $eq: ["$read", false] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            {
                $unwind: "$userDetails"
            },
            {
                $project: {
                    id: "$userDetails._id",
                    name: "$userDetails.name",
                    email: "$userDetails.email",
                    role: "$userDetails.role",
                    // avatar: "$userDetails.profileImage", // Assuming profileImage exists, or use name initials
                    lastMessage: "$lastMessage.text",
                    timestamp: "$lastMessage.createdAt",
                    unread: "$unreadCount"
                }
            },
            {
                $sort: { timestamp: -1 }
            }
        ]);

        res.json(conversations);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get messages between current user and another user
router.get('/:userId', authenticateToken, async (req, res) => {
    try {
        const currentUserId = req.user._id;
        const otherUserId = req.params.userId;

        const messages = await Message.find({
            $or: [
                { sender: currentUserId, recipient: otherUserId },
                { sender: otherUserId, recipient: currentUserId }
            ]
        }).sort({ createdAt: 1 });

        // Mark messages as read
        await Message.updateMany(
            { sender: otherUserId, recipient: currentUserId, read: false },
            { read: true }
        );

        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Send a message
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { recipientId, text } = req.body;
        const senderId = req.user._id;

        if (!recipientId || !text) {
            return res.status(400).json({ message: 'Recipient and text are required' });
        }

        const newMessage = new Message({
            sender: senderId,
            recipient: recipientId,
            text
        });

        await newMessage.save();

        // Emit socket event for real-time update
        const io = req.app.get('io');
        if (io) {
            io.to(recipientId).emit('receive_message', {
                _id: newMessage._id,
                sender: senderId,
                recipient: recipientId,
                text: newMessage.text,
                createdAt: newMessage.createdAt,
                read: false
            });
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
