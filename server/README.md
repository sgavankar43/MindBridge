# MindBridge Server

Backend server for the MindBridge mental health platform built with Node.js, Express, and MongoDB Atlas.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: Complete user profiles with mental health tracking
- **Security**: Helmet, rate limiting, password hashing with bcrypt
- **Database**: MongoDB Atlas integration with Mongoose ODM
- **Validation**: Express-validator for input validation
- **CORS**: Configured for frontend integration

## Setup Instructions

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Environment Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update the `.env` file with your configuration:

```env
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mindbridge?retryWrites=true&w=majority

# JWT Secret (Generate a strong secret key)
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173
```

### 3. MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster (free tier available)
3. Create a database user with read/write permissions
4. Get your connection string and replace the placeholder in `.env`
5. Whitelist your IP address in Network Access

### 4. Start the Server

Development mode (with nodemon):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication Routes (`/api/auth`)

- `POST /register` - Register new user
- `POST /login` - User login
- `GET /me` - Get current user profile
- `POST /refresh` - Refresh JWT token
- `POST /logout` - User logout
- `POST /verify-email` - Verify email address

### User Routes (`/api/users`)

- `GET /:id` - Get user profile by ID
- `PUT /profile` - Update user profile
- `PUT /preferences` - Update user preferences
- `PUT /mental-health` - Update mental health profile
- `POST /goals` - Add new goal
- `PUT /goals/:goalId` - Toggle goal completion
- `GET /therapists` - Get all therapists
- `DELETE /account` - Delete user account

### Health Check

- `GET /api/health` - Server health check

## Database Schema

### User Model

```javascript
{
  // Basic Information
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  
  // Profile
  avatar: String,
  bio: String,
  phone: String,
  role: ['user', 'therapist', 'admin'],
  profession: String,
  
  // Security
  isEmailVerified: Boolean,
  twoFactorEnabled: Boolean,
  lastLogin: Date,
  
  // Preferences
  preferences: {
    theme: ['light', 'dark', 'system'],
    language: String,
    notifications: Object,
    privacy: Object
  },
  
  // Mental Health Data
  mentalHealthProfile: {
    currentMood: ['great', 'good', 'okay', 'bad', 'terrible'],
    goals: Array,
    streakCount: Number,
    longestStreak: Number
  }
}
```

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Rate Limiting**: Prevents brute force attacks
- **Helmet**: Security headers
- **Input Validation**: Express-validator
- **CORS**: Configured for specific origins

## Development

### Project Structure

```
server/
├── models/          # Database models
├── routes/          # API routes
├── middleware/      # Custom middleware
├── .env.example     # Environment template
├── server.js        # Main server file
└── package.json     # Dependencies
```

### Adding New Features

1. Create model in `models/` directory
2. Add routes in `routes/` directory
3. Add middleware if needed in `middleware/`
4. Update server.js to include new routes

## Deployment

### Environment Variables for Production

```env
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
PORT=5000
CLIENT_URL=https://your-frontend-domain.com
```

### Recommended Hosting

- **Backend**: Heroku, Railway, DigitalOcean
- **Database**: MongoDB Atlas (managed)
- **Environment**: Node.js 18+ recommended

## Testing

Health check endpoint:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "MindBridge Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Support

For issues and questions:
1. Check the logs for error messages
2. Verify environment variables are set correctly
3. Ensure MongoDB Atlas connection is working
4. Check that all dependencies are installed

## License

MIT License - see LICENSE file for details