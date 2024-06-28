const express=require('express');
const { protectedRoute } = require('../middleware/protectedRoute');
const { createPost, deletePost, commentPost, likeUnlikePost, getAllPost, getFollowingPost, getUserPost } = require('../controllers/postController');

const router=express.Router();

router.get("/all",protectedRoute,getAllPost)
router.get("/following",protectedRoute,getFollowingPost)
router.get("/user/:username",protectedRoute,getUserPost)
router.post("/create",protectedRoute,createPost)
router.delete("/:id",protectedRoute,deletePost)
router.post("/comment/:id",protectedRoute,commentPost)
router.post("/like/:id",protectedRoute,likeUnlikePost)


module.exports=router