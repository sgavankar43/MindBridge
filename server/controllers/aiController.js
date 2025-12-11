const AIChat = require('../models/AIChat');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');

exports.chatWithAI = async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user._id;

        if (!process.env.GEMINI_API_KEY) {
             return res.status(503).json({
                 message: 'AI Service unavailable (Missing API Key)',
                 response: "I'm sorry, I'm not fully configured yet. Please contact the administrator."
             });
        }

        // Get or create chat history
        let chat = await AIChat.findOne({ user: userId });
        if (!chat) {
            chat = new AIChat({ user: userId, messages: [] });
        }

        // Prepare history for Gemini
        // Gemini expects: [{ role: "user", parts: [{ text: "..." }] }, { role: "model", parts: [{ text: "..." }] }]
        // We limit context to last 20 messages to save tokens/cost
        const history = chat.messages.slice(-20).map(msg => ({
            role: msg.role,
            parts: [{ text: msg.content }]
        }));

        const model = genAI.getGenerativeModel({ model: "gemini-pro"});

        const chatSession = model.startChat({
            history: history,
            generationConfig: {
                maxOutputTokens: 500,
            },
        });

        const result = await chatSession.sendMessage(message);
        const response = result.response.text();

        // Save to DB
        chat.messages.push({ role: 'user', content: message });
        chat.messages.push({ role: 'model', content: response });
        await chat.save();

        res.json({ response });
    } catch (error) {
        console.error('AI Chat Error:', error);
        res.status(500).json({ message: 'Error communicating with AI' });
    }
};

exports.getAIHistory = async (req, res) => {
    try {
        const userId = req.user._id;
        const chat = await AIChat.findOne({ user: userId });

        res.json(chat ? chat.messages : []);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching history' });
    }
};
