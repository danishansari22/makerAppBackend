const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const Makerspace = require('../Models/spaceModel.js'); 
const User = require('../Models/userModel.js');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});
const JWT_SECRET = "Karkhana"

const sendEmail = async (email, id, password) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.office365.com', // Outlook SMTP server
    port: 587, // Port for TLS
    secure: false, // Use TLS
    auth: {
      user: process.env.EMAIL_SERVER_USER, // Your Outlook email address
      pass: process.env.EMAIL_SERVER_PASSWORD, // Your Outlook email password
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_SERVER_USER, // Sender address
    to: email, // Recipient address
    subject: 'Your Makerspace Account Details',
    text: `Your account has been created successfully.\n\nID: ${id}\nPassword: ${password}\n\nPlease log in to your account.`,
  };

  await transporter.sendMail(mailOptions);
};

const onboardMakerspace = async (req, res) => {
  try {
    console.log('Onboarding request:', req.body);
    const { vendormail } = req.body;

    if (!vendormail) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if makerspace with same email already exists
    const existingMakerspace = await Makerspace.findOne({ email: vendormail });

  

    if (existingMakerspace) {
      return res
        .status(400)
        .json({ message: 'Makerspace with this email already exists' });
    }
    


    // Generate JWT token with email
    const token = jwt.sign({ vendormail }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });

    const makerspace = new Makerspace({
      email: vendormail,
      token:token
    });
    await makerspace.save();

    res.status(200).json({token}  )

  } catch (error) {
    console.error('Check email error:', error);
    res.status(500).json({ message: 'Error checking email' });
  }
};

// Verify onboarding token
const verifyOnboardingToken = async (req, res) => {
  try {
    const { token } = req.params;
    console.log('Verifying token:', token);

    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Check if the makerspace exists
    const makerspace = await Makerspace.findOne({ email: decoded.vendormail });
    if (!makerspace) {
      return res.status(404).json({ message: 'Invalid token or makerspace not found', isValid: false });
    }

    res.status(200).json({ message: 'Token verified successfully', isValid: true, email: makerspace.email,token:token });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Invalid or expired token', isValid: false });
  }
};


const getAllSpaces = async (req, res) => {
  try {
    const spaces = await Makerspace.find();
    res.status(200).json(spaces);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

const getSpaceById = async (req, res) => {
  try {
    const { id } = req.params;
    const space = await Makerspace.findById(id);
    if (!space) {
      return res.status(404).json({ message: 'Space not found' });
    }
    res.status(200).json(space);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};



const uploadImages = async (files) => {
  const imageLinks = [];
  for (const file of files) {
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `spaces/${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };
    const uploadResult = await s3.upload(params).promise();
    imageLinks.push(uploadResult.Location);
  }
  return imageLinks;
};

// Create a new makerspace (completes onboarding)
// Update an existing verified makerspace (completes onboarding)
const createMakerspace = async (req, res) => {
  try {
    // Extract the token from the Authorization header

    const { email, type, usage, name, number, inChargeName, websiteLink, timings, city, state, address, zipcode, country, organizationName, organizationEmail } = req.body;


    // Find the makerspace by email
    const existingMakerspace = await Makerspace.findOne({ email });
    if (!existingMakerspace) {
      return res.status(404).json({ message: 'Makerspace not found for the provided email' });
    }

    // Upload images if provided
    const imageLinks = req.files ? await uploadImages(req.files) : [];

    // Update the existing makerspace with the provided data
    const updatedMakerspace = await Makerspace.findByIdAndUpdate(
      existingMakerspace._id,
      {
        type,
        usage,
        name,
        number,
        inChargeName,
        websiteLink,
        timings,
        city,
        state,
        address,
        zipcode,
        country,
        organizationName,
        organizationEmail,
        $push: { imageLinks }, // Add new images to the existing list
      },
      { new: true }
    );

    // Auto-signup for the user
    const password = Math.random().toString(36).slice(-8); // Generate a random password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
      firstName: inChargeName || 'Makerspace',
      userType: 'vendor',
    });

    await newUser.save();

    // Generate a new JWT token for the user
    const loginToken = jwt.sign(
      { id: newUser._id, email: newUser.email, userType: newUser.userType },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Send email to the user with ID and password
    await sendEmail(email, email, password);

    res.status(200).json({
      message: 'Makerspace updated successfully',
      makerspace: updatedMakerspace,
      loginToken,
    });
  } catch (error) {
    console.error('Error updating makerspace:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get a makerspace by name
const getMakerspaceByName = async (req, res) => {
  try {
    const { name } = req.params;
    const makerspace = await Makerspace.findOne({ name });
    if (!makerspace) {
      return res.status(404).json({ message: 'Makerspace not found' });
    }
    res.status(200).json(makerspace);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get makerspaces by city
const getMakerspacesByCity = async (req, res) => {
  try {
    const { city } = req.params;
    const makerspaces = await Makerspace.find({ city }).select('name');
    const names = makerspaces.map((space) => space.name);
    res.status(200).json(names);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};


const updateSpace = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedSpace = await Makerspace.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedSpace) {
      return res.status(404).json({ message: 'Space not found' });
    }
    res.status(200).json({ message: 'Space updated successfully', space: updatedSpace });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

const deleteSpace = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSpace = await Makerspace.findByIdAndDelete(id);
    if (!deletedSpace) {
      return res.status(404).json({ message: 'Space not found' });
    }
    res.status(200).json({ message: 'Space deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

module.exports = {
  getAllSpaces,
  getSpaceById,
  createMakerspace,
  getMakerspaceByName,
  getMakerspacesByCity,
  updateSpace,
  deleteSpace,
  onboardMakerspace,
  verifyOnboardingToken,
};