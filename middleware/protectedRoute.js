
const User = require("../models/userModel")
const jwt=require("jsonwebtoken")

exports.protectedRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt

        if (!token) {
            return res.status(401).json({ error: "Unauthorized : no token provided " })
        }

        // const decode = jwt.verify(token, process.env.JWT_SECRET)
        const decode=jwt.verify(token, process.env.JWT_SECRET)

        if (!decode) {
            return res.status(401).json({ error: "Unauthorized: Invalid token" })
        }

        const user = await User.findById(decode.userId).select("-password")

        if (!user) {
            return res.status(404).json({ error: "user not found" })
        }

        req.user = user
        next()

    } catch (error) {
        console.log("Error in protected Routes", error.message);
        return res.status(500).json({ error: "internale server Error" })
    }
}