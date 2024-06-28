const express=require('express')
const { protectedRoute } = require('../middleware/protectedRoute')
const { getNotifications, deleteNotifications } = require('../controllers/notificationController')

// create object of router
const router=new express.Router()


router.get('/',protectedRoute,getNotifications)
router.delete('/',protectedRoute,deleteNotifications)



module.exports=router