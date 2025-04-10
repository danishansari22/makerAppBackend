const Event = require('../Models/eventsModel'); // Assuming Event is the model for events
const MakerSpace = require('../Models/spaceModel'); // Assuming MakerSpace is the model for makerspaces
const jwt = require('jsonwebtoken');
const AWS = require('aws-sdk');

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
      Key: `events/${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };
    const uploadResult = await s3.upload(params).promise();
    imageLinks.push(uploadResult.Location);
  }
  return imageLinks;
};

// Create a new event
const createEvent = async (req, res) => {
  try {
    // Extract the token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token is missing or invalid' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the makerspace by email
    const makerspace = await MakerSpace.findOne({ email: decoded.email });
    if (!makerspace) {
      return res.status(404).json({ message: 'Makerspace not found for the provided email' });
    }

    const { category, name, date, time, ticket, ticketLimit, description, agenda, terms, location, experts } = req.body;

    const imageLinks = req.files ? await uploadImages(req.files) : [];

    const newEvent = new Event({
      category,
      name,
      date,
      time,
      ticket,
      ticketLimit,
      imageLinks,
      description,
      agenda,
      terms,
      location,
      experts,
      makerSpace: makerspace._id, // Use the makerspace ID from the database
    });

    await newEvent.save();
    res.status(201).json({ message: 'Event created successfully', event: newEvent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get events by makerspace name (case-insensitive)
const getEventsByMakerSpaceName = async (req, res) => {
  try {
    const { makerspace } = req.params;
    const makerspaceName = makerspace.trim().toLowerCase();

    const makerspaceDoc = await MakerSpace.findOne({ name: { $regex: new RegExp(`^${makerspaceName}$`, 'i') } });
    if (!makerspaceDoc) {
      return res.status(404).json({ message: 'Makerspace not found' });
    }

    const events = await Event.find({ makerSpace: makerspaceDoc._id });
    res.status(200).json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get events by multiple makerspace names
const getEventsByMakerSpaceNames = async (req, res) => {
  try {
    const makerspaceNames = req.body.map((name) => name.trim().toLowerCase());

    const makerspaces = await MakerSpace.find({ name: { $in: makerspaceNames } });
    const makerspaceIds = makerspaces.map((space) => space._id);

    const events = await Event.find({ makerSpace: { $in: makerspaceIds } });
    res.status(200).json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// Update an event by ID
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const imageLinks = req.files ? await uploadImages(req.files) : [];
    const updatedData = { ...req.body };
    if (imageLinks.length > 0) {
      updatedData.imageLinks = imageLinks;
    }

    const updatedEvent = await Event.findByIdAndUpdate(id, updatedData, { new: true });
    if (!updatedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.status(200).json({ message: 'Event updated successfully', event: updatedEvent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
};

module.exports = {
  createEvent,
  getEventsByMakerSpaceName,
  getEventsByMakerSpaceNames,
  updateEvent,
};