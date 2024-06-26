const express=require('express')
const {  signup, signin, logout, getMe } = require('../controllers/authController')
const { protectedRoute } = require('../middleware/protectedRoute')

// create object of router
const router=new express.Router()


router.get('/me',protectedRoute,getMe)
router.post('/signup',signup)
router.post('/signin',signin)
router.post('/logout',logout)

module.exports=router
