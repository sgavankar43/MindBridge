const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    content: {
        type: String,
        required: [true, 'Post content is required'],
        maxlength: [2000, 'Content cannot exceed 2000 characters']
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    image: {
        type: String, // URL from Cloudinary
        default: null
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    hashtags: [{
        type: String,
        trim: true
    }],
    topics: [{
        type: String,
        trim: true
    }]
}, {
    timestamps: true
});

// Index for search
postSchema.index({ content: 'text', hashtags: 'text' });

module.exports = mongoose.model('Post', postSchema);
