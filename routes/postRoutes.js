const express=require('express');
const { protectedRoute } = require('../middleware/protectedRoute');
const { createPost, deletePost, commentPost, likeUnlikePost, getAllPost, getFollowingPost, getUserPost, getMyPosts } = require('../controllers/postController');
const upload = require('../middleware/multermiddleware');

const router=express.Router();

router.get("/all",getAllPost)
router.get("/following",protectedRoute,getFollowingPost)
router.get("/user/:username",protectedRoute,getUserPost)
router.get("/",protectedRoute,getMyPosts)
// router.post("/create",protectedRoute,createPost)
router.post("/create", protectedRoute, upload.single('img'), createPost);
router.delete("/:id",protectedRoute,deletePost)
router.post("/comment/:id",protectedRoute,commentPost)
router.post("/like/:id",protectedRoute,likeUnlikePost)


module.exports=router