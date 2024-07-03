const { generateToken } = require("../lib/utils/generateToken")
const User = require("../models/userModel")
const bcrypt = require('bcrypt')

exports.signup = async (req, res) => {
	try {
		const { fullName, username, email, password } = req.body;

		// const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		// if (!emailRegex.test(email)) {
		// 	return res.status(400).json({ error: "Invalid email format" });
		// }
		
		const existingUser = await User.findOne({ username });
		console.log("existingUser ",existingUser);
		if (existingUser) {
			return res.status(400).json({ error: "Username is already taken" });
		}
		console.log("registration1");
		const existingEmail = await User.findOne({ email });
		if (existingEmail) {
			return res.status(400).json({ error: "Email is already taken" });
		}
		console.log("registration2");
		if (password.length < 6) {
			return res.status(400).json({ error: "Password must be at least 6 characters long" });
		}
		console.log("registration3");
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);
		
		const newUser = new User({
			fullName,
			username,
			email,
			password: hashedPassword,
		});
			console.log(newUser);
		if (newUser) {
			await newUser.save();
			const token = generateToken(newUser._id);
			res.status(201).json({
				token,
				user: {
					_id: newUser._id,
					fullName: newUser.fullName,
					username: newUser.username,
					email: newUser.email,
					followers: newUser.followers,
					following: newUser.following,
					profileImg: newUser.profileImg,
					coverImg: newUser.coverImg,
				},
			});
		} else {
			res.status(400).json({ error: "Invalid user data" });
		}
	} catch (error) {
		console.log("Error in signup controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

exports.signin = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

        if (!user || !isPasswordCorrect) {
            return res.status(400).json({ error: "Invalid username or password" });
        }

        const token = generateToken(user._id);

        res.status(200).json({
            token,
            user: {
                _id: user._id,
                fullName: user.fullName,
                username: user.username,
                email: user.email,
                followers: user.followers,
                following: user.following,
                profileImg: user.profileImg,
                coverImg: user.coverImg,
            },
        });
    } catch (error) {
        console.log("Error in signin controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.logout = async (req, res) => {
    try {
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.log("Error in logout controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.getMe = async (req, res) => {
	try {
		const user = await User.findById(req.user._id).select("-password");
		res.status(200).json(user);
	} catch (error) {
		console.log("Error in getMe controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};
