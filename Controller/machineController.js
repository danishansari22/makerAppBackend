const Machine = require('../Models/Machine');
const MakerSpace = require('../Models/spaceModel'); // Assuming MakerSpace is the model for makerspaces
const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');

// AWS S3 Configuration
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Middleware for uploading images
const uploadImages = async (files) => {
  const imageLinks = [];
  for (const file of files) {
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `machines/${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };
    const uploadResult = await s3.upload(params).promise();
    imageLinks.push(uploadResult.Location);
  }
  return imageLinks;
};

// Create a new machine
const createMachine = async (req, res) => {
  try {
    const { category, brand, model, price, time, description, location, instruction, inCharge, makerSpace, status } = req.body;

    const imageLinks = req.files ? await uploadImages(req.files) : [];
    const parsedTime = typeof time === 'string' ? JSON.parse(time) : time;
    const NEWinCharge = typeof req.body.inCharge === 'string'
    ? JSON.parse(req.body.inCharge)
    : req.body.inCharge;

    const newMachine = new Machine({
      category,
      brand,
      model,
      price,
      time: parsedTime,
      imageLinks,
      description,                         
      location,
      instruction,
      inCharge: NEWinCharge,
      makerSpaceName:makerSpace ,
      status,
    });

    await newMachine.save();
    res.status(201).json({ message: 'Machine created successfully', machine: newMachine });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get machines by makerspace name (case-insensitive, allows multiple comma-separated names)
const getMachinesByMakerSpaceName = async (req, res) => {
  try {
    const { makerspace } = req.params;
    const makerspaceNames = makerspace.split(',').map((name) => name.trim().toLowerCase());

    const makerspaces = await MakerSpace.find({ name: { $in: makerspaceNames } });
    const makerspaceIds = makerspaces.map((space) => space._id);

    const machines = await Machine.find({ makerSpace: { $in: makerspaceIds } });
    res.status(200).json(machines);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get machines by multiple makerspace names (from request body)
const getMachinesByMakerSpaceNames = async (req, res) => {
  try {
    const makerspaceNames = req.body.map((name) => name.trim().toLowerCase());

    const makerspaces = await MakerSpace.find({ name: { $in: makerspaceNames } });
    const makerspaceIds = makerspaces.map((space) => space._id);

    const machines = await Machine.find({ makerSpace: { $in: makerspaceIds } });
    res.status(200).json(machines);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// Update a machine by ID
const updateMachine = async (req, res) => {
  try {
    const { id } = req.params;

    const imageLinks = req.files ? await uploadImages(req.files) : [];
    const updatedData = { ...req.body };
    if (imageLinks.length > 0) {
      updatedData.imageLinks = imageLinks;
    }

    const updatedMachine = await Machine.findByIdAndUpdate(id, updatedData, { new: true });
    if (!updatedMachine) {
      return res.status(404).json({ message: 'Machine not found' });
    }

    res.status(200).json({ message: 'Machine updated successfully', machine: updatedMachine });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
};

module.exports = {
  createMachine,
  getMachinesByMakerSpaceName,
  getMachinesByMakerSpaceNames,
  updateMachine,
};