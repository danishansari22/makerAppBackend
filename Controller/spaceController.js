const AWS = require('aws-sdk');

const Makerspace = require('../Models/spaceModel.js'); 

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

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



const createSpace = async (req, res) => {
  try {
    const { files } = req; // Assuming `files` contains the uploaded images
    const imageLinks = [];

    // Upload each file to S3
    for (const file of files) {
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `spaces/${Date.now()}-${file.originalname}`, // Unique file name
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      const uploadResult = await s3.upload(params).promise();
      imageLinks.push(uploadResult.Location); // Store the S3 URL
    }

    // Generate a unique _id with prefix and suffix
    const uniqueNumber = Date.now(); // You can replace this with any unique number generator
    const customId = `KARV${uniqueNumber}V`;

    // Create a new makerspace with the custom _id and image links
    const newSpace = new Makerspace({
      _id: customId, // Assign the custom _id
      ...req.body,
      imageLinks, // Add the S3 URLs to the database
    });

    await newSpace.save();
    res.status(201).json({ message: 'Space created successfully', space: newSpace });
  } catch (error) {
    console.error(error);
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
  createSpace,
  updateSpace,
  deleteSpace,
};