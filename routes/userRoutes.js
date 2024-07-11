const express = require('express');
const { protectedRoute } = require('../middleware/protectedRoute');
const { getUserProfile, followUnfollowUser, getSuggestedUsers, updateUser, getFollowingList, getUsersSidBar, getSingleUser, getAllUsers } = require('../controllers/userController');
const upload = require('../middleware/multermiddleware');

const router = express.Router();

router.get('/profile/:username', protectedRoute, getUserProfile);
router.post('/follow/:id', protectedRoute, followUnfollowUser);
router.get('/suggest', protectedRoute, getSuggestedUsers);

// Use upload.fields([]) for multiple file upload fields
router.post('/update', protectedRoute, upload.fields([{ name: 'profileImg' }, { name: 'coverImg' }]), updateUser);

router.get('/following', protectedRoute, getFollowingList);


router.get('/',protectedRoute,getUsersSidBar)
router.get('/singleuser/:id',protectedRoute,getSingleUser)
router.get('/allusers',protectedRoute,getAllUsers)

module.exports = router;
