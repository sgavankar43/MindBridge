const Post = require('../models/Post');
const Comment = require('../models/Comment');

exports.createPost = async (req, res) => {
    try {
        const { content, hashtags } = req.body;
        let image = null;

        if (req.file) {
            image = req.file.path || req.file.url;
        }

        const post = new Post({
            content,
            author: req.user._id,
            image,
            hashtags: hashtags ? (Array.isArray(hashtags) ? hashtags : JSON.parse(hashtags)) : []
        });

        await post.save();

        // Populate author details
        await post.populate('author', 'name avatar role profession');

        res.status(201).json(post);
    } catch (error) {
        console.error('Create Post Error:', error);
        res.status(500).json({ message: 'Failed to create post' });
    }
};

exports.getPosts = async (req, res) => {
    try {
        const { search, topic } = req.query;
        let query = {};

        if (search) {
            query.$text = { $search: search };
        }

        if (topic) {
            query.hashtags = topic;
        }

        const posts = await Post.find(query)
            .populate('author', 'name avatar role profession')
            .sort({ createdAt: -1 })
            .limit(50); // Pagination can be added later

        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch posts' });
    }
};

exports.toggleLike = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const index = post.likes.indexOf(req.user._id);
        if (index === -1) {
            post.likes.push(req.user._id);
        } else {
            post.likes.splice(index, 1);
        }

        await post.save();
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error toggling like' });
    }
};

exports.addComment = async (req, res) => {
    try {
        const { content } = req.body;
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const comment = new Comment({
            content,
            author: req.user._id,
            post: post._id
        });

        await comment.save();

        post.comments.push(comment._id);
        await post.save();

        await comment.populate('author', 'name avatar');

        res.status(201).json(comment);
    } catch (error) {
        res.status(500).json({ message: 'Error adding comment' });
    }
};

exports.getComments = async (req, res) => {
    try {
        const comments = await Comment.find({ post: req.params.id })
            .populate('author', 'name avatar')
            .sort({ createdAt: 1 });
        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching comments' });
    }
};
