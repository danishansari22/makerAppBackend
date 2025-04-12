// makerAppBackend/Routes/userRoutes.js
const express = require('express');
const {
  signup,
  login,
  reauth,
  getUserByContact,
  forgotPassword,
  resetPassword,
} = require('../Controller/usersController');
 // Middleware for protected routes

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

router.get('/by-contact', getUserByContact);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;