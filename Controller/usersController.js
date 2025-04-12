const User = require('../Models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, userType: user.userType },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// POST /api/users/signup
const signup = async (req, res) => {
  try {
    const { email, password, name, number, usertype, industry, purpose } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
      firstName: name,
      mobile: number,
      userType: usertype,
      industry,
      purpose,
    });

    await newUser.save();

    const token = generateToken(newUser);

    res.status(201).json({
      user: { ...newUser.toObject(), password: undefined },
      token,
    });
  } catch (error) {
    console.error('Error signing up user:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// POST /api/users/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    res.status(200).json({
      user: { ...user.toObject(), password: undefined },
      token,
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// GET /api/users/reauth
const reauth = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const token = generateToken(user);

    res.status(200).json({
      user: { ...user.toObject(), password: undefined },
      token,
    });
  } catch (error) {
    console.error('Error re-authenticating user:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// GET /api/users/by-contact
const getUserByContact = async (req, res) => {
  try {
    const { email, number } = req.query;

    const user = await User.findOne({
      $or: [{ email }, { mobile: number }],
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ email: user.email });
  } catch (error) {
    console.error('Error fetching user by contact:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// POST /api/users/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_SERVER_USER,
      to: email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Use the following token to reset your password: ${resetToken}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Password reset link sent to your email' });
  } catch (error) {
    console.error('Error sending password reset email:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// POST /api/users/reset-password
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({
      _id: decoded.id,
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

module.exports = {
  signup,
  login,
  reauth,
  getUserByContact,
  forgotPassword,
  resetPassword,
};