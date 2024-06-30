const Notification = require("../models/notificationModel");
const User = require("../models/userModel");
const bcrypt = require('bcrypt');

exports.getUserProfile = async (req, res) => {
    const { username } = req.params;
    try {
        const user = await User.findOne({ username }).select('-password');
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error("Error in get User Profile", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.followUnfollowUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userToModify = await User.findById(id);
        const currentUser = await User.findById(req.user._id);

        if (id == req.user._id.toString()) {
            return res.status(400).json({ error: "User cannot follow or unfollow yourself" });
        }

        if (!userToModify || !currentUser) {
            return res.status(404).json({ error: "User not found" });
        }

        const isFollowing = currentUser.following.includes(id);

        if (isFollowing) {
            await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
            await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
            res.status(200).json({ message: "User unfollowed successfully" });
        } else {
            await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
            await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });

            const newNotification = new Notification({
                type: 'follow',
                from: req.user._id,
                to: userToModify._id
            });
            await newNotification.save();
            res.status(200).json({ message: "User followed successfully" });
        }
    } catch (error) {
        console.error("Error in follow and unfollow user", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.getSuggestedUsers = async (req, res) => {
    try {
        const userId = req.user._id;
        const userFollowedMe = await User.findById(userId).select("following");
        const users = await User.aggregate([
            { $match: { _id: { $ne: userId } } },
            { $sample: { size: 10 } }
        ]);

        const filteredUser = users.filter(user => !userFollowedMe.following.includes(user._id));
        const suggestedUsers = filteredUser.slice(0, 4).map(user => ({
            _id: user._id,
            username: user.username,
            fullName: user.fullName,
            profileImg: user.profileImg
        }));

        res.status(200).json(suggestedUsers);
    } catch (error) {
        console.error("Error in suggest users", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.updateUser = async (req, res) => {
    const { fullName, email, username, currentPassword, newPassword, bio } = req.body;
    const userId = req.user._id;
    const profileImg = req.file?.filename;
    // const coverImg = req.file?.filename; // Assuming the field name in req.body or req.file is coverImg
    console.log(req.file);
    
    try {
        let user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if ((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
            return res.status(400).json({ error: "Please provide both current password and new password" });
        }

        if (currentPassword && newPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ error: "Current password is incorrect" });
            }
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        user.fullName = fullName || user.fullName;
        user.email = email || user.email;
        user.username = username || user.username;
        user.bio = bio || user.bio;
        user.profileImg = profileImg || user.profileImg;
        // user.coverImg = coverImg || user.coverImg; // Update coverImg field

        user = await user.save();
        user.password = null;

        res.status(200).json(user);
    } catch (error) {
        console.error("Error in update user", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.getFollowingList = async (req, res) => {
    try {
        const currentUser = await User.findById(req.user._id).populate('following', '-password');
        if (!currentUser) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json(currentUser.following);
    } catch (error) {
        console.error("Error in get following list", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};
