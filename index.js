const express = require('express')
const router = require('./routes/authRoutes')
const dotenv = require('dotenv')
const connectMongoDB = require('./db/dbConnect')
const authRoutes=require('./routes/authRoutes')
const userRoutes=require('./routes/userRoutes')
const postRoutes=require('./routes/postRoutes')
const cookieParser = require('cookie-parser')
const cloudinary = require("cloudinary").v2;

const app = express()
dotenv.config()
cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_SECRET_KEY
})
app.use(router)
app.use(express.json()) // to parse req.body
app.use(express.urlencoded({extended:true})) // to parse form data
app.use(cookieParser())

app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/post', postRoutes)



const PORT = process.env.PORT || 8000

app.listen(PORT, () => {
    console.log(`Server Running on port ${PORT}`);
    connectMongoDB()
})

