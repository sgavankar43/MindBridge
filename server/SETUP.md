# MindBridge Server Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Setup Environment Variables
```bash
# Copy the example file
cp .env.example .env

# Edit .env with your MongoDB Atlas connection string
nano .env  # or use your preferred editor
```

### 3. Configure MongoDB Atlas

#### Get Your Connection String:
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Sign in or create an account
3. Create a new cluster (free tier available)
4. Click "Connect" → "Connect your application"
5. Copy the connection string

#### Update .env file:
```env
MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/mindbridge?retryWrites=true&w=majority
JWT_SECRET=mindbridge_super_secret_jwt_key_2024_mental_health_platform_secure_token_generator_12345
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### 4. Test Database Connection
```bash
node test-connection.js
```

### 5. Start the Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

## Troubleshooting

### Common Issues:

#### 1. "MONGODB_URI environment variable is required"
- Make sure you have a `.env` file in the server directory
- Check that MONGODB_URI is set in the .env file

#### 2. "Authentication failed"
- Verify your username and password in the connection string
- Make sure the database user exists in MongoDB Atlas
- Check that the user has read/write permissions

#### 3. "Network timeout" or "Connection refused"
- Check your internet connection
- Verify your IP address is whitelisted in MongoDB Atlas:
  - Go to Network Access in MongoDB Atlas
  - Add your IP address or use 0.0.0.0/0 for testing

#### 4. "Port 5000 is already in use"
- Change the PORT in .env file to a different number (e.g., 5001)
- Or stop the process using port 5000

### Testing Endpoints:

Once the server is running, test these endpoints:

```bash
# Health check
curl http://localhost:5000/api/health

# Test endpoint
curl http://localhost:5000/api/test

# Auth test
curl http://localhost:5000/api/auth/test
```

Expected responses:
- Health check should return server status and database connection
- All endpoints should return JSON responses

### Database Setup:

The server will automatically:
1. Connect to MongoDB Atlas
2. Create the database if it doesn't exist
3. Set up collections when first documents are created

### Security Notes:

- The JWT_SECRET should be a long, random string in production
- Never commit the .env file to version control
- Use environment-specific .env files for different deployments

### Development Tips:

1. Use `npm run dev` for development (auto-restarts on changes)
2. Check server logs for detailed error messages
3. Use the test-connection.js script to verify database connectivity
4. Monitor the MongoDB Atlas dashboard for connection status

## Next Steps:

1. Test the registration endpoint with a REST client (Postman, Insomnia)
2. Verify JWT token generation and validation
3. Test the frontend login/registration pages
4. Set up proper error logging for production

## Support:

If you encounter issues:
1. Check the server console for error messages
2. Verify all environment variables are set correctly
3. Test the database connection separately
4. Ensure your MongoDB Atlas cluster is running and accessible