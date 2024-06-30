const Notification = require("../models/notificationModel");
const Post = require("../models/postModel");
const User = require("../models/userModel")
const cloudinary = require("cloudinary").v2;


exports.createPost = async (req, res) => {
    console.log("asd");
    try {
        console.log('req.body:', req.body); // Add this line
        console.log('req.file:', req.file); // Add this line

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


exports.getMyPosts = async (req, res) => {
    try {
        const userId = req.user._id; // Get user ID from authenticated token

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
exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if (!post) {
            return res.status(404).json({ error: "Post not found" })
        }
        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ error: "You are not authorized to delete this post" })
        }

        if (post.img) {
            const imgId = post.img.split("/").pop().split(".")[0]
            await cloudinary.uploader.destroy(imgId)

        }

        await Post.findByIdAndDelete(req.params.id)
        res.status(200).json({ message: " Post deleted sucessfully" })
    } catch (error) {
        console.log("Error in delete post");
        res.status(500).json({ error: "internal server error" })
    }
}

exports.commentPost = async (req, res) => {
    try {
        const { text } = req.body
        const postId = req.params.id
        const userId = req.user._id
        
        

        if (!text) {
            return res.status(404).json({ error: "Text field is required" })
        }
        const post = await Post.findById(postId)
        if (!post) {
            return res.status(404).json({ error: "Post not found" })
        }

        const comment = { user: userId, text }

        post.comments.push(comment)
        await post.save()

        res.status(200).json(post)
    } catch (error) {
        console.log("Error in comment post");
        res.status(500).json({ error: "internal server error" })
    }
}

exports.likeUnlikePost = async (req, res) => {
    try {
        
        const userId = req.user._id
        const { id: postId } = req.params
        const post = await Post.findById(postId)

        if (!post) {
            return res.status(404).json({ error: "Posts not found" })
        }

        const userLikedPost = post.likes.includes(userId)

        if (userLikedPost) {
            // unlike post


            await Post.updateOne({ _id: postId }, { $pull: { likes: userId } })
            res.status(202).json({ message: "Post unliked sucessfully" })
        }
        else {
            // like post
            post.likes.push(userId)
            await post.save()

            const notification = new Notification({
                from: userId,
                to: post.user,
                type: 'like'
            })
            await notification.save()
            res.status(200).json({ message: "Post liked Successfully" })
        }
    } catch (error) {
        console.log("Error in like Unlike Post ", error);
        res.status(500).json({ error: "internal server error" })
    }
}

exports.getAllPost = async (req, res) => {
    try {
        const post = await Post.find().sort({ createdAt: -1 }).populate({
            path: 'user',
            select: '-password'
        })
            .populate({
                path: 'comments.user',
                select: '-password'
            })
        if (post.length === 0) {
            return res.status(200).json([])
        }
        res.status(200).json(post)


    }
    catch (error) {
        console.log("Error in get all Post ", error);
        res.status(500).json({ error: "internal server error" })
    }
}

exports.getFollowingPost = async (req, res) => {
    try {
        const userId = req.user._id
        const user = await User.findById(userId)

        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }
        const following = user.following
        const feedPost = await Post.find({ user: { $in: following } }).sort({ createdAt: -1 }).populate({
            path: 'user',
            select: '-password'
        }).populate({
            path: 'comments.user',
            select: '-password'
        })
        res.status(200).json(feedPost)
    }
    catch (error) {
        console.log("Error in get following Post ", error);
        res.status(500).json({ error: "internal server error" })
    }
}

exports.getUserPost = async (req, res) => {
    try {
        const {username} = req.params
        const user=await User.findOne({username})
        if(!user){
            return res.status(404).json({error: "User not found"})
        }

        const post=await Post.find({user:user._id}).sort({createdAt:-1}).populate({
            path:'user',
            select:'-password'
        }).populate({
            path:'comments.user',
            select:'-password'
        })
        res.status(200).json(post)
    }
    catch (error) {
        console.log("Error in get user Post ", error);
        res.status(500).json({ error: "internal server error" })
    }
}