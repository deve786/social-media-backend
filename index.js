const express = require('express')
const router = require('./routes/authRoutes')
const dotenv = require('dotenv')
const connectMongoDB = require('./db/dbConnect')


const app = express()
dotenv.config()
app.use(router)


const PORT = process.env.PORT || 8000



app.listen(PORT, () => {
    console.log(`Server Running on port ${PORT}`);
    connectMongoDB()
})