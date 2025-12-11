const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
    api_key: process.env.CLOUDINARY_API_KEY || '1234567890',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'secret'
});

// Configure Storage
// If cloud credentials are not present, this will fail in production,
// but for the sandbox without keys, we can use a fallback or just accept the code structure.
// The user asked to "write code for cloudinary", so we prioritize that.

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'mindbridge',
        allowed_formats: ['jpg', 'png', 'jpeg', 'pdf'],
        resource_type: 'auto'
    }
});

// Local storage fallback for testing/dev if needed (optional implementation detail)
// but sticking to Cloudinary as primary.

const upload = multer({ storage: storage });

module.exports = { upload, cloudinary };
