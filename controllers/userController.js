const Notification = require("../models/notificationModel")
const User = require("../models/userModel")

exports.getUserProfile = async (req, res) => {
    const { username } = req.params
    try {
        const user = await User.findOne({ username }).select('-password')

        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }
        res.status(200).json(user)
    }
    catch (error) {
        console.log("Error in get User Profile", error.message);
        log.status(500).json({ error: error.message })

    }
}


exports.followUnfollowUser = async (req, res) => {

    try {
        const { id } = req.params

        const userToModify = await User.findById(id)
        const currentUser = await User.findById(req.user._id)

        if (id == req.user._id.toString()) {
            return res.status(400).json({ error: "User Cannot follow or Unfollow Yourself" })
        }

        if (!userToModify || !currentUser) {
            return res.status(404).json({ error: " user not found" })
        }

        const isFollowing = currentUser.following.includes(id)

        if (isFollowing) {
            // UNFOLLOW the user
            await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } })
            await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } })
            res.status(200).json({ message: "User Unfollowed Sucessfully " })
        }
        else {
            // FOLLOW the user
            await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } })
            await User.findByIdAndUpdate(req.user._id, { $push: { following: id } })

            //send notification to user
            const newNotification = new Notification({
                type: 'follow',
                from: req.user._id,
                to: userToModify._id
            })
            await newNotification.save()
            res.status(200).json({ message: "User Followed Sucessfully " })

        }

    } catch (error) {
        console.log("Error in Follow and UnfollowUser ", error.message);
        res.status(500).json({ error: error.message })
    }
}

exports.getsuggestedUsers = async (req, res) => {
    try {
        const userId = req.user._id

        const userFollowedMe = await User.findById(userId).select("following")

        const users = await User.aggregate([
            {
                $match: {
                    _id: { $ne: userId }
                }

            },
            {
                $sample: {
                    size:10
                }
            }
        ])

        const filteredUser=users.filter(user=>!userFollowedMe.following.includes(user._id))
        const suggestedUser=filteredUser.slice(0,4)

        suggestedUser.forEach(user=>user.password=null)

        res.status(200).json(suggestedUser)

    } catch (error) {
        console.log("Error in suggest users ", error.message);
        res.status(500).json({ error: error.message })
    }
}