const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cloudinary = require("cloudinary").v2;
const cors = require('cors');
const connectMongoDB = require('./db/dbConnect');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Initialize app
const app = express();
dotenv.config();

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

// Middleware
app.use(express.json()); // to parse req.body
app.use(express.urlencoded({ extended: true })); // to parse form data
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/post', postRoutes);
app.use('/api/notifications', notificationRoutes);

// Connect to MongoDB and start the server
const PORT = process.env.PORT || 8000;
connectMongoDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch(error => {
    console.error("Failed to connect to MongoDB", error);
    process.exit(1);
});
