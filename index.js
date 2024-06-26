const express = require('express')
const router = require('./routes/authRoutes')
const dotenv = require('dotenv')
const connectMongoDB = require('./db/dbConnect')
const authRoutes=require('./routes/authRoutes')
const userRoutes=require('./routes/userRoutes')
const cookieParser = require('cookie-parser')

const app = express()
dotenv.config()
app.use(router)
app.use(express.json()) // to parse req.body
app.use(express.urlencoded({extended:true})) // to parse form data
app.use(cookieParser())

app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)



const PORT = process.env.PORT || 8000

app.listen(PORT, () => {
    console.log(`Server Running on port ${PORT}`);
    connectMongoDB()
})

