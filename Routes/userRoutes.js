// makerAppBackend/Routes/userRoutes.js
const express = require('express');
const {
  signup,
  login,
  reauth,
  getUserByContact,
  forgotPassword,
  resetPassword,
  autoLogin
} = require('../Controller/usersController');
 // Middleware for protected routes
const { authenticateJWT } = require('../Utils/authMiddlewre');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/reauth',  reauth); // Reauthentication route
router.get('/by-contact', getUserByContact);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/autologin',  autoLogin); // Auto-login route

module.exports = router;