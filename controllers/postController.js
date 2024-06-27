const Post = require("../models/postModel");
const User = require("../models/userModel")
const cloudinary = require("cloudinary").v2;
exports.createPost=async(req,res)=>{
    try {
        const {text}=req.body
        let {img} =req.body
        const userId=req.user._id.toString()

        const user=await User.findById(userId)
        if(!user){
            return res.status(404).json({message:"User not found"})
        }
        if(!text && !img){
            return res.status(400).json({error: "Post must have text or image"})
        }
        if(img){

            const uploadedResponse = await cloudinary.uploader.upload(img)
            img = uploadedResponse.secure_url
        }

        const newPost=new Post({
            user:userId,
            text,
            img
        })

        await newPost.save()
        res.status(201).json(newPost)
    } catch (error) {
        console.log("Error in create post",error);
        res.status(500).json({error:"internal server error"})
    }
}

exports.deletePost=async(req,res)=>{
    try {
        const post=await Post.findById(req.params.id)
        if(!post){
            return res.status(404).json({error: "Post not found"}) 
        }
        if(post.user.toString() !== req.user._id.toString()){
            return res.status(401).json({error:"You are not authorized to delete this post"})
        }

        if(post.img){
            const imgId=post.img.split("/").pop().split(".")[0]
            await cloudinary.uploader.destroy(imgId)

        }

        await Post.findByIdAndDelete(req.params.id)
        res.status(200).json({message:" Post deleted sucessfully"})
    } catch (error) {
        console.log("Error in delete post"); 
        res.status(500).json({error:"internal server error"})
    }
}