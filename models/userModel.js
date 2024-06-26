const {  mongoose } = require("mongoose");

const userModel=new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    fullName:{
        type:String,
        required:true,
        
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        
    },
    followers:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        default:[]
    }],
    following:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        default:[]
    }],
    profileImg:{
        type:String,
        default:""
    },
    coverImg:{
        type:String,
        default:""
    },
    bio:{
        type:String,
        default:""
    },
    link:{
        type:String,
        default:""
    },
},{timestamps:true})

const User=mongoose.model("User",userModel)

module.exports=User