# Quick Start Guide

## 1. Install Dependencies
```bash
cd server
npm install
```

## 2. Start Server (Basic Test)
```bash
npm run dev
```

## 3. Test Endpoints
Open these URLs in your browser:
- http://localhost:5000/ (should show "MindBridge Server is running!")
- http://localhost:5000/api/test (should show "API is working!")
- http://localhost:5000/api/health (should show server status)

## 4. Test CORS
Try the registration from your frontend. The server should now accept requests from localhost:5173.

## 5. If Everything Works, Add Database
Update your .env file with your MongoDB Atlas connection string:
```env
MONGODB_URI=your_actual_mongodb_connection_string_here
```

## Troubleshooting

### Server won't start:
```bash
# Check if port 5000 is in use
lsof -i :5000

# Kill process if needed
kill -9 <PID>

# Or use different port
PORT=5001 npm run dev
```

### CORS still not working:
1. Make sure server is running on port 5000
2. Check browser console for exact error
3. Try accessing http://localhost:5000/api/test directly

### Dependencies missing:
```bash
npm install express mongoose cors dotenv
```