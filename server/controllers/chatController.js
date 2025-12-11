const Message = require('../models/Message');
const User = require('../models/User');

// Send a message
exports.sendMessage = async (req, res) => {
    try {
        const { recipientId, content } = req.body;
        const senderId = req.user._id;

        const message = new Message({
            sender: senderId,
            recipient: recipientId,
            content
        });

        await message.save();

        res.status(201).json(message);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Error sending message' });
    }
};

// Get messages between current user and another user
exports.getMessages = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user._id;

        const messages = await Message.find({
            $or: [
                { sender: currentUserId, recipient: userId },
                { sender: userId, recipient: currentUserId }
            ]
        }).sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Error fetching messages' });
    }
};

// Get list of conversations
exports.getConversations = async (req, res) => {
    try {
        const currentUserId = req.user._id;

        // Find all messages involving the current user
        const messages = await Message.find({
            $or: [
                { sender: currentUserId },
                { recipient: currentUserId }
            ]
        })
        .sort({ createdAt: -1 })
        .populate('sender', 'name avatar role')
        .populate('recipient', 'name avatar role');

        // Extract unique users
        const conversationsMap = new Map();

        messages.forEach(msg => {
            const otherUser = msg.sender._id.toString() === currentUserId.toString()
                ? msg.recipient
                : msg.sender;

            if (!conversationsMap.has(otherUser._id.toString())) {
                conversationsMap.set(otherUser._id.toString(), {
                    user: otherUser,
                    lastMessage: msg
                });
            }
        });

        const conversations = Array.from(conversationsMap.values());
        res.json(conversations);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ message: 'Error fetching conversations' });
    }
};
