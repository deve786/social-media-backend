const express = require('express');
const router = express.Router();
const { signup, signin, logout, getMe } = require('../controllers/authController');
const { protectedRoute } = require('../middleware/protectedRoute');



router.post('/signup', signup);
router.post('/signin', signin);
router.post('/logout', logout);
router.get('/me', protectedRoute, getMe);

module.exports = router;
