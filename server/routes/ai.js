const express = require('express');
const router = express.Router();
const AISession = require('../models/AISession');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { authenticateToken } = require('../middleware/auth');

// Initialize Gemini
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
    console.warn("⚠️  GEMINI_API_KEY is missing from environment variables. AI Chat will not function correctly.");
}
const genAI = new GoogleGenerativeAI(API_KEY || 'dummy_key_to_prevent_crash');

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
            if (!process.env.GEMINI_API_KEY) {
                throw new Error("GEMINI_API_KEY is not configured on the server.");
            }

            // Prepare history for Gemini
            // Map 'model' role to Gemini's 'model' and 'user' to 'user'
            let geminiHistory = session.messages.map(msg => ({
                role: msg.role === 'ai' ? 'model' : msg.role,
                parts: [{ text: msg.content }]
            }));

            // Sanitize history: Merge consecutive messages from the same role
            if (geminiHistory.length > 0) {
                const sanitizedHistory = [];
                let lastMsg = geminiHistory[0];

                for (let i = 1; i < geminiHistory.length; i++) {
                    const currentMsg = geminiHistory[i];
                    if (currentMsg.role === lastMsg.role) {
                        // Merge content
                        lastMsg.parts[0].text += "\n" + currentMsg.parts[0].text;
                    } else {
                        sanitizedHistory.push(lastMsg);
                        lastMsg = currentMsg;
                    }
                }
                sanitizedHistory.push(lastMsg);
                geminiHistory = sanitizedHistory;
            }

            // Ensure the history passed to startChat ends with 'model' if it exists, 
            // because the next message (in sendMessage) will be 'user'.
            // If the last message in history is 'user', we must remove it from history 
            // and actually it should have been the prompt, but here we are using the 'message' body param as the new prompt.
            // So 'history' should effectively be the CONTEXT.

            // However, session.messages ALREADY includes the 'new' message we just pushed on line 82.
            // So we should NOT include the very last message in 'history', because that is the one we are sending via sendMessage.

            // Correct logic:
            // 1. Take all messages EXCEPT the last one (which is the current user prompt).
            // 2. Sanitize THAT list.

            const currentPrompt = session.messages[session.messages.length - 1]; // The one we just added
            const previousMessages = session.messages.slice(0, -1);

            let historyForGemini = previousMessages.map(msg => ({
                role: msg.role === 'ai' ? 'model' : msg.role,
                parts: [{ text: msg.content }]
            }));

            // Sanitize
            if (historyForGemini.length > 0) {
                const merged = [];
                let last = historyForGemini[0];
                for (let i = 1; i < historyForGemini.length; i++) {
                    if (historyForGemini[i].role === last.role) {
                        last.parts[0].text += "\n" + historyForGemini[i].parts[0].text;
                    } else {
                        merged.push(last);
                        last = historyForGemini[i];
                    }
                }
                merged.push(last);
                historyForGemini = merged;
            }

            const model = genAI.getGenerativeModel({
                model: "gemini-1.5-flash",
                systemInstruction: SYSTEM_INSTRUCTION
            });

            const chat = model.startChat({
                history: historyForGemini,
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
            console.error('Failed History Payload:', JSON.stringify(history, null, 2)); // Debug logging
            console.error('Failed Message:', message);

            let errorMessage = "I'm having trouble connecting right now. Please try again later.";

            // Customize error message for missing key
            if (aiError.message.includes("GEMINI_API_KEY")) {
                errorMessage = "The AI service is currently unavailable (System Configuration Error).";
            } else if (aiError.message.includes("400")) {
                errorMessage = "I didn't quite catch that. Could you rephrase?";
            } else if (aiError.message.includes("429") || aiError.message.includes("Quota")) {
                errorMessage = "I've hit my usage limit for the moment. Please wait a minute and try again (Google API Quota Exceeded).";
            }

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
