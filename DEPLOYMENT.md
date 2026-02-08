# MindBridge Deployment Guide

## 🚀 Production Deployment Checklist

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account (or MongoDB instance)
- Cloudinary account for media uploads
- Google Gemini API key
- Production hosting (Vercel, Netlify, Railway, etc.)

---

## 📋 Environment Variables Setup

### Client (.env)
Create a `.env` file in the `client` directory:

```env
# Production API URL
VITE_API_URL=https://your-backend-domain.com

# App Configuration
VITE_APP_NAME=MindBridge
VITE_APP_VERSION=1.0.0
```

### Server (.env)
Create a `.env` file in the `server` directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/mindbridge?retryWrites=true&w=majority

# JWT Secret (Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('base64'))")
JWT_SECRET=your_production_jwt_secret_here

# Server Configuration
PORT=5002
NODE_ENV=production

# Frontend URLs (comma-separated for multiple domains)
CLIENT_URL=https://your-frontend-domain.com,https://www.your-frontend-domain.com

# Gemini API Key
GEMINI_API_KEY=your_gemini_api_key

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 🔧 Build & Deploy Steps

### 1. Client Deployment (Frontend)

#### Option A: Vercel
```bash
cd client
npm install
npm run build

# Deploy to Vercel
vercel --prod
```

#### Option B: Netlify
```bash
cd client
npm install
npm run build

# Deploy dist folder to Netlify
netlify deploy --prod --dir=dist
```

#### Build Configuration:
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Node Version**: 18+

### 2. Server Deployment (Backend)

#### Option A: Railway
```bash
cd server
npm install

# Deploy to Railway
railway up
```

#### Option B: Render/Heroku
```bash
cd server
npm install

# Set environment variables in platform dashboard
# Deploy using platform CLI or Git integration
```

#### Server Configuration:
- **Start Command**: `npm start`
- **Node Version**: 18+
- **Port**: Use `process.env.PORT` (auto-assigned by platform)

---

## 🔐 Security Checklist

- [ ] Generate new JWT_SECRET for production (never use development secrets)
- [ ] Update MongoDB credentials with production database
- [ ] Set NODE_ENV=production
- [ ] Configure CORS with specific frontend URLs (not wildcard)
- [ ] Enable HTTPS on both frontend and backend
- [ ] Review and update rate limiting settings
- [ ] Secure API keys (never commit to Git)
- [ ] Enable MongoDB IP whitelist (if using Atlas)

---

## 🧪 Testing Production Build Locally

### Test Client Build:
```bash
cd client
npm run build
npm run preview
```

### Test Server:
```bash
cd server
NODE_ENV=production npm start
```

---

## 📊 Post-Deployment Verification

1. **Health Check**: Visit `https://your-backend-domain.com/api/health`
2. **CORS Test**: Ensure frontend can connect to backend
3. **Socket.IO**: Test real-time messaging functionality
4. **Database**: Verify MongoDB connection
5. **File Uploads**: Test Cloudinary integration
6. **AI Features**: Verify Gemini API integration

---

## 🔄 Environment-Specific Configuration

### Development
```bash
NODE_ENV=development
CLIENT_URL=http://localhost:5173
VITE_API_URL=http://localhost:5002
```

### Staging
```bash
NODE_ENV=production
CLIENT_URL=https://staging.yourdomain.com
VITE_API_URL=https://api-staging.yourdomain.com
```

### Production
```bash
NODE_ENV=production
CLIENT_URL=https://yourdomain.com,https://www.yourdomain.com
VITE_API_URL=https://api.yourdomain.com
```

---

## 🐛 Troubleshooting

### CORS Errors
- Verify CLIENT_URL in server .env matches your frontend domain
- Check NODE_ENV is set correctly
- Ensure both HTTP and HTTPS variants are included if needed

### Socket.IO Connection Issues
- Verify VITE_API_URL in client .env
- Check WebSocket support on hosting platform
- Review Socket.IO CORS configuration

### Database Connection Errors
- Verify MongoDB URI format
- Check IP whitelist in MongoDB Atlas
- Ensure network access is configured

---

## 📝 Quick Deploy Commands

### Install Dependencies:
```bash
# From root directory - install all dependencies
npm run install:all
```

### Development:
```bash
# Run both client and server in development mode
npm run dev
```

### Individual Deployments:
```bash
# Client only
cd client && npm run build && vercel --prod

# Server only
cd server && railway up
```

---

## 🔗 Useful Resources

- [Vite Production Build](https://vitejs.dev/guide/build.html)
- [Express Production Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [MongoDB Atlas Setup](https://www.mongodb.com/docs/atlas/)
- [Socket.IO Production Guide](https://socket.io/docs/v4/server-deployment/)

---

## ⚠️ Important Notes

1. **Never commit `.env` files** - Use `.env.example` as template
2. **Rotate secrets regularly** - Especially JWT_SECRET and API keys
3. **Monitor logs** - Set up error tracking (Sentry, LogRocket, etc.)
4. **Backup database** - Regular MongoDB backups
5. **SSL/TLS** - Always use HTTPS in production
