const express=require('express')
const { protectedRoute } = require('../middleware/protectedRoute')
const { getNotifications, deleteNotifications, deleteNotification } = require('../controllers/notificationController')

// create object of router
const router=new express.Router()


router.get('/',protectedRoute,getNotifications)
router.delete('/',protectedRoute,deleteNotifications)
// router.delete('/:id',protectedRoute,deleteNotification)



module.exports=router