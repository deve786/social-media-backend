const express=require('express')
const { protectedRoute } = require('../middleware/protectedRoute')
const { getUserProfile, followUnfollowUser, getsuggestedUsers } = require('../controllers/userController')
const router=express.Router()


router.get('/profile/:username',protectedRoute,getUserProfile)
router.post('/follow/:id',protectedRoute,followUnfollowUser)
router.get('/suggest',protectedRoute,getsuggestedUsers)
module.exports=router