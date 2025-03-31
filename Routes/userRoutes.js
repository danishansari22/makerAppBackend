// makerAppBackend/Routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../Models/userModel');
const { hashPassword } = require('../Utils/user');

// Update user data
router.put('/update', async (req, res) => {
  try {
    const { userId, firstName, lastName, email, mobile, userType, industry, skills, role, links, purpose, image, password } = req.body;

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user fields
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    user.mobile = mobile || user.mobile;
    user.userType = userType || user.userType;
    user.industry = industry || user.industry;
    user.skills = skills || user.skills;
    user.role = role || user.role;
    user.links = links || user.links;
    user.purpose = purpose || user.purpose;
    user.image = image || user.image;

    // If password is provided, hash it before saving
    if (password) {
      user.password = await hashPassword(password);
    }

    // Save the updated user
    await user.save();

    res.status(200).json({ message: 'User updated successfully', user });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

module.exports = router;