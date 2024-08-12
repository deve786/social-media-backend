const Notification = require("../models/notificationModel");
const Post = require("../models/postModel");
const User = require("../models/userModel");
const cloudinary = require("cloudinary").v2;

// Create Post
exports.createPost = async (req, res) => {
    try {
        const { text } = req.body;
        const userId = req.user._id.toString();

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!text && !req.file) {
            return res.status(400).json({ error: 'Post must have text or image' });
        }

        const img = req.file ? req.file.path : null;

        const newPost = new Post({
            user: userId,
            img,
            text,
        });

        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        console.error('Error in create post', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get My Posts
exports.getMyPosts = async (req, res) => {
    try {
        const userId = req.user._id;

        const posts = await Post.find({ user: userId })
            .sort({ createdAt: -1 })
            .populate({
                path: 'user',
                select: '-password'
            })
            .populate({
                path: 'comments.user',
                select: '-password'
            });

        res.status(200).json(posts);
    } catch (error) {
        console.error("Error in get my posts:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Delete Post
exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }
        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ error: "You are not authorized to delete this post" });
        }

        await Post.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        console.log("Error in delete post");
        res.status(500).json({ error: "Internal server error" });
    }
};

// Comment on Post
exports.commentPost = async (req, res) => {
    try {
        const { text } = req.body;
        const postId = req.params.id;
        const userId = req.user._id;

        if (!text) {
            return res.status(404).json({ error: "Text field is required" });
        }
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        const comment = { user: userId, text };

        post.comments.push(comment);
        await post.save();

        res.status(200).json(post);
    } catch (error) {
        console.log("Error in comment post");
        res.status(500).json({ error: "Internal server error" });
    }
};

// Like/Unlike Post
exports.likeUnlikePost = async (req, res) => {
    try {
        const userId = req.user._id;
        const { id: postId } = req.params;
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        const userLikedPost = post.likes.includes(userId);

        if (userLikedPost) {
            await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
            res.status(202).json({ message: "Post unliked successfully" });
        } else {
            post.likes.push(userId);
            await post.save();

            const notification = new Notification({
                from: userId,
                to: post.user,
                type: 'like'
            });
            await notification.save();
            res.status(200).json({ message: "Post liked successfully" });
        }
    } catch (error) {
        console.log("Error in like/unlike post", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get All Posts
exports.getAllPost = async (req, res) => {
    try {
        const post = await Post.find().sort({ createdAt: -1 }).populate({
            path: 'user',
            select: '-password'
        }).populate({
            path: 'comments.user',
            select: '-password'
        });
        if (post.length === 0) {
            return res.status(200).json([]);
        }
        res.status(200).json(post);
    } catch (error) {
        console.log("Error in get all posts", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get Following Posts
exports.getFollowingPost = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const following = user.following;
        const feedPost = await Post.find({ user: { $in: following } }).sort({ createdAt: -1 }).populate({
            path: 'user',
            select: '-password'
        }).populate({
            path: 'comments.user',
            select: '-password'
        });
        res.status(200).json(feedPost);
    } catch (error) {
        console.log("Error in get following posts", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get User Posts
exports.getUserPost = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const post = await Post.find({ user: user._id }).sort({ createdAt: -1 }).populate({
            path: 'user',
            select: '-password'
        }).populate({
            path: 'comments.user',
            select: '-password'
        });
        res.status(200).json(post);
    } catch (error) {
        console.log("Error in get user posts", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Like/Unlike Comment
exports.likeUnlikeComment = async (req, res) => {
    try {
        const userId = req.user._id;
        const { postId, commentId } = req.params;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        const comment = post.comments.id(commentId);
       
        if (!comment) {
            return res.status(404).json({ error: "Comment not found" });
        }

        const userLikedComment = comment.likes.includes(userId);

        if (userLikedComment) {
            comment.likes.pull(userId);
        } else {
            comment.likes.push(userId);
        }

        await post.save();
        res.status(200).json({ message: "Successfully liked/unliked the comment", post });
    } catch (error) {
        console.error("Error in like/unlike comment:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Delete Comment
exports.deleteComment = async (req, res) => {
    try {
        const userId = req.user._id;
        const { postId, commentId } = req.params;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        const comment = post.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ error: "Comment not found" });
        }

        if (comment.user.toString() !== userId.toString()) {
            return res.status(401).json({ error: "You are not authorized to delete this comment" });
        }

        // Use MongoDB's $pull operator to remove the comment
        await Post.updateOne(
            { _id: postId },
            { $pull: { comments: { _id: commentId } } }
        );

        res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
        console.error("Error in delete comment:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
