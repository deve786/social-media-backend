const express=require('express');
const { protectedRoute } = require('../middleware/protectedRoute');
const { createPost, deletePost } = require('../controllers/postController');

const router=express.Router();

router.post("/create",protectedRoute,createPost)
router.delete("/:id",protectedRoute,deletePost)


module.exports=router