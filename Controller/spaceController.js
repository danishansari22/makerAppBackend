const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const Makerspace = require('../Models/spaceModel.js'); 

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});
const JWT_SECRET = "Karkhana"
const onboardMakerspace = async (req, res) => {
  try {
    const { vendormail } = req.body;

    // Check if the email already exists in the database
    const existingMakerspace = await Makerspace.findOne({ email: vendormail });
    if (existingMakerspace) {
      return res.status(400).json({ message: 'Makerspace with this email already exists' });
    }

    // Generate a token with the vendor's email
    const token = jwt.sign({ vendormail }, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// Verify onboarding token
const verifyOnboardingToken = async (req, res) => {
  try {
    const { token } = req.params;

    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Check if the makerspace exists
    const makerspace = await Makerspace.findOne({ email: decoded.vendormail });
    if (!makerspace) {
      return res.status(404).json({ message: 'Invalid token or makerspace not found', isValid: false });
    }

    res.status(200).json({ message: 'Token verified successfully', isValid: true, email: makerspace.email });
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
const createMakerspace = async (req, res) => {
  try {
    const { token } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const existingMakerspace = await Makerspace.findOne({ email: decoded.vendormail });
    if (!existingMakerspace) {
      return res.status(404).json({ message: 'Invalid token or makerspace not found' });
    }
    const uniqueNumber = Date.now(); // You can replace this with any unique number generator
    const customId = `KARV${uniqueNumber}V`;

    const imageLinks = req.files ? await uploadImages(req.files) : [];
    const newMakerspace = new Makerspace({
      ...req.body,
      id: customId,
      email: decoded.vendormail,
      imageLinks,
    });

    await newMakerspace.save();
    res.status(201).json({ message: 'Makerspace created successfully', makerspace: newMakerspace });
  } catch (error) {
    console.error(error);
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