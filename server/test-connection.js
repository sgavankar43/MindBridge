// Simple script to test MongoDB connection
require('dotenv').config();
const mongoose = require('mongoose');

console.log('🧪 Testing MongoDB Connection...');

if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in environment variables');
    process.exit(1);
}

console.log('🔗 Attempting to connect to MongoDB...');
console.log('📍 URI:', process.env.MONGODB_URI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log('✅ MongoDB connection successful!');
        console.log('📊 Connection details:');
        console.log('   - Database:', mongoose.connection.name);
        console.log('   - Host:', mongoose.connection.host);
        console.log('   - Ready State:', mongoose.connection.readyState);

        // Test creating a simple document
        const testSchema = new mongoose.Schema({ test: String });
        const TestModel = mongoose.model('Test', testSchema);

        return TestModel.create({ test: 'connection-test' });
    })
    .then((doc) => {
        console.log('✅ Test document created:', doc._id);
        return mongoose.connection.db.collection('tests').deleteOne({ _id: doc._id });
    })
    .then(() => {
        console.log('✅ Test document cleaned up');
        console.log('🎉 Database connection test completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ MongoDB connection failed:', error.message);

        if (error.message.includes('authentication failed')) {
            console.error('🔐 Authentication Error:');
            console.error('   - Check your username and password in MONGODB_URI');
            console.error('   - Ensure the database user exists in MongoDB Atlas');
        } else if (error.message.includes('network')) {
            console.error('🌐 Network Error:');
            console.error('   - Check your internet connection');
            console.error('   - Verify your IP is whitelisted in MongoDB Atlas');
        } else if (error.message.includes('timeout')) {
            console.error('⏰ Timeout Error:');
            console.error('   - Check MongoDB Atlas network access settings');
            console.error('   - Try whitelisting 0.0.0.0/0 for testing');
        }

        process.exit(1);
    });