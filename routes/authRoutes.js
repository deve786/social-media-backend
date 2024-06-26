const express=require('express')
const { Home } = require('../controllers/authController')

// create object of router
const router=new express.Router()



router.get('/',Home)

module.exports=router
