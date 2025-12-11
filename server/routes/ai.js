const express = require('express');
const router = express.Router();
const AISession = require('../models/AISession');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { authenticateToken } = require('../middleware/auth');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_INSTRUCTION = `You are MindBridge AI, a compassionate, empathetic, and professional mental health assistant.
Your goal is to provide supportive listening, coping strategies, and psychoeducation.
You are NOT a licensed therapist and cannot diagnose or prescribe medication.
Always encourage professional help if the user seems in crisis.
Keep your responses concise, warm, and helpful.`;

// Create a new session
router.post('/sessions', authenticateToken, async (req, res) => {
    try {
        const session = new AISession({
            user: req.user._id,
            title: 'New Conversation',
            messages: []
        });
        await session.save();
        res.status(201).json(session);
    } catch (error) {
        console.error('Error creating AI session:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all sessions for a user
router.get('/sessions', authenticateToken, async (req, res) => {
    try {
        const sessions = await AISession.find({ user: req.user._id }).sort({ updatedAt: -1 });
        res.json(sessions);
    } catch (error) {
        console.error('Error fetching AI sessions:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get a specific session
router.get('/sessions/:id', authenticateToken, async (req, res) => {
    try {
        const session = await AISession.findOne({ _id: req.params.id, user: req.user._id });
        if (!session) return res.status(404).json({ message: 'Session not found' });
        res.json(session);
    } catch (error) {
        console.error('Error fetching session:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Send a message
router.post('/message', authenticateToken, async (req, res) => {
    const { sessionId, message } = req.body;

    if (!message) {
        return res.status(400).json({ message: 'Message is required' });
    }

    try {
        let session;
        if (sessionId) {
            session = await AISession.findOne({ _id: sessionId, user: req.user._id });
            if (!session) return res.status(404).json({ message: 'Session not found' });
        } else {
            // Create new if not provided
            session = new AISession({
                user: req.user._id,
                title: message.substring(0, 30) + '...',
                messages: []
            });
        }

        // Add user message to history
        session.messages.push({ role: 'user', content: message });

        // Save user message immediately so it persists even if AI fails
        session.updatedAt = Date.now();
        await session.save();

        try {
            // Prepare history for Gemini
            // Map 'model' role to Gemini's 'model' and 'user' to 'user'
            const history = session.messages.map(msg => ({
                role: msg.role === 'ai' ? 'model' : msg.role,
                parts: [{ text: msg.content }]
            }));

            const model = genAI.getGenerativeModel({
                model: "gemini-1.5-flash",
                systemInstruction: SYSTEM_INSTRUCTION
            });

            const chat = model.startChat({
                history: history.slice(0, -1), // Send all but the last one which is the new prompt
                generationConfig: {
                    maxOutputTokens: 1000,
                },
            });

            const result = await chat.sendMessage(message);
            const responseText = result.response.text();

            // Add AI response to history
            session.messages.push({ role: 'model', content: responseText });

            // Update title if it's the first message exchange and still default
            if (session.messages.length <= 2 && session.title === 'New Conversation') {
                session.title = message.substring(0, 30) + (message.length > 30 ? '...' : '');
            }

            session.updatedAt = Date.now();
            await session.save();

            res.json({
                response: responseText,
                sessionId: session._id,
                sessionTitle: session.title
            });
        } catch (aiError) {
            console.error('Gemini API Error:', aiError);
            // Return success but with a placeholder/error message from AI so frontend doesn't break
            // Or we can return the saved session but indicate AI failed.
            // For now, let's append a system error message to the chat so the user knows.

            const errorMessage = "I'm having trouble connecting right now. Please try again later.";
            session.messages.push({ role: 'model', content: errorMessage });
            await session.save();

            res.json({
                response: errorMessage,
                sessionId: session._id,
                sessionTitle: session.title
            });
        }

    } catch (error) {
        console.error('Error in AI chat:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a session
router.delete('/sessions/:id', authenticateToken, async (req, res) => {
    try {
        const result = await AISession.deleteOne({ _id: req.params.id, user: req.user._id });
        if (result.deletedCount === 0) return res.status(404).json({ message: 'Session not found' });
        res.json({ message: 'Session deleted' });
    } catch (error) {
        console.error('Error deleting session:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
