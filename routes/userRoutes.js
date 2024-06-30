const express = require('express');
const { protectedRoute } = require('../middleware/protectedRoute');
const { getUserProfile, followUnfollowUser, getsuggestedUsers, updateUser, getFollowingList, getSuggestedUsers } = require('../controllers/userController');
const upload = require('../middleware/multermiddleware');

const router = express.Router();

router.get('/profile/:username', protectedRoute, getUserProfile);
router.post('/follow/:id', protectedRoute, followUnfollowUser);
router.get('/suggest', protectedRoute, getSuggestedUsers);
router.post('/update', protectedRoute, upload.single('profileImg'), updateUser); // Use upload.single for single file upload

router.get('/following', protectedRoute, getFollowingList);

module.exports = router;
