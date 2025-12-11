
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testAI() {
    console.log("🔍 Checking AI Configuration...");

    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
        console.error("❌ GEMINI_API_KEY is MISSING in .env file");
        console.log("   Please add GEMINI_API_KEY=your_api_key_here to server/.env");
        process.exit(1);
    }

    console.log("✅ GEMINI_API_KEY found (length: " + API_KEY.length + ")");

    try {
        console.log("🔄 Attempting to connect to Gemini API...");
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent("Say 'Hello, World!' if you can hear me.");
        const response = await result.response;
        const text = response.text();

        console.log("✅ Connection Successful!");
        console.log("🤖 AI Response:", text);
    } catch (error) {
        console.error("❌ Connection Failed:", error.message);
        if (error.message.includes("API_KEY_INVALID")) {
            console.error("   The provided API Key seems to be invalid.");
        } else if (error.message.includes("quota")) {
            console.error("   You may have exceeded your API quota.");
        }
        process.exit(1);
    }
}

testAI();
