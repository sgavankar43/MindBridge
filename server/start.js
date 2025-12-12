// Startup script with better error handling
console.log('🚀 Starting MindBridge Server...');

// Check Node.js version
const nodeVersion = process.version;
console.log('📍 Node.js version:', nodeVersion);

// Load environment variables
require('dotenv').config();

// Check if .env file exists
const fs = require('fs');
const path = require('path');

if (!fs.existsSync(path.join(__dirname, '.env'))) {
    console.error('❌ .env file not found!');
    console.error('📝 Please create a .env file based on .env.example');
    process.exit(1);
}

// Check required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingEnvVars.forEach(envVar => {
        console.error(`   - ${envVar}`);
    });
    console.error('📝 Please check your .env file');
    process.exit(1);
}

// Check if MongoDB URI looks valid
if (!process.env.MONGODB_URI.includes('mongodb')) {
    console.error('❌ MONGODB_URI does not appear to be a valid MongoDB connection string');
    console.error('📝 It should start with mongodb:// or mongodb+srv://');
    process.exit(1);
}

console.log('✅ Environment variables loaded');
console.log('✅ Starting server...');

// Start the actual server
require('./server.js');