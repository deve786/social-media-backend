const mongoose = require('mongoose')

const connectMongoDB = async(req,res) => {
    try {
        const conn=await mongoose.connect(process.env.MONGO_URI)
        console.log(`MongoDB is connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error Connection to MongoDB: ${error.message}`)
        process.exit(1)
    }
}

module.exports=connectMongoDB