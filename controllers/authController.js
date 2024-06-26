const { generateTokenAndSetCookies } = require("../lib/utils/generateTokenAndSetCookie")
const User = require("../models/userModel")
const bcrypt = require('bcrypt')

exports.signup = async (req, res) => {
    try {

        const { username, email, fullName, password } = req.body

        const existingUsername = await User.findOne({ username })
        if (existingUsername) {
            return res.status(400).json({ error: "Username already taken" })
        }

        const existingEmail = await User.findOne({ email })
        if (existingEmail) {
            return res.status(400).json({ error: "Email already taken" })
        }

        // hash password
        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(password, salt)

        const newUser = new User({
            username,
            fullName,
            email,
            password: hashPassword
        })

        if (newUser) {
            generateTokenAndSetCookies(newUser._id, res)
            await newUser.save()

            res.status(201).json({
                _id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                fullName: newUser.fullName,
                followers: newUser.followers,
                following: newUser.following,
                profileImg: newUser.profileImg,
                coverImg: newUser.coverImg,


            })
        }
        else {
            res.status(400).json({ error: "Invalid user data" })
        }
    }
    catch (error) {
        console.log("error in signup controller", error.message);
        res.status(500).json({ error: "Internal server error" })
    }
}


exports.signin = async (req, res) => {
    try {

        const { username, password } = req.body
        const user = await User.findOne({ username })
        const isPasswordCorrect = await bcrypt.compare(password, user?.password || "")
        if (!user || !isPasswordCorrect) {
           return res.status(400).json({ error: "Invalid username or password" })
        }

        generateTokenAndSetCookies(user._id, res)

        res.status(200).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            followers: user.followers,
            following: user.following,
            profileImg: user.profileImg,
            coverImg: user.coverImg,
        })


    }
    catch (error) {
        console.log("error in signin controller", error.message);
        res.status(500).json({ error: "Internal server error" })
    }
}

exports.logout=async(req,res)=>{
    try {
        res.cookie("jwt","",{maxAge:0})
        res.status(200).json({message:"Logout Succesfully...."})
    } catch (error) {
        console.log("Error in logout controller",error.message);
        res.status(500).json({error:"Internal server error"})
    }
}


exports.getMe=async(req,res)=>{
    try {
        const user=await User.findById(req.user._id).select("-password")
        res.status(200).json(user)
    } catch (error) {
        console.log("Error in getMe controller",error.message);
        res.status(500).json({error:"Internal server error"})
    }
}