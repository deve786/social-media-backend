const express=require('express')
const { protectedRoute } = require('../middleware/protectedRoute')
const { getUserProfile, followUnfollowUser, getsuggestedUsers, updateUser, getFollowingList } = require('../controllers/userController')
const router=express.Router()


router.get('/profile/:username',protectedRoute,getUserProfile)
router.post('/follow/:id',protectedRoute,followUnfollowUser)
router.get('/suggest',protectedRoute,getsuggestedUsers)
router.post('/update',protectedRoute,updateUser)

router.get('/following',protectedRoute,getFollowingList)

module.exports=router