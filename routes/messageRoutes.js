const { getMessages, sendMessage } =require( "../controllers/messageController.js")
const  { protectedRoute } =require( "../middleware/protectedRoute.js")

const express=require( "express")



const router = express.Router();

router.get("/:id", protectedRoute, getMessages);
router.post("/send/:id", protectedRoute, sendMessage);

module.exports = router;