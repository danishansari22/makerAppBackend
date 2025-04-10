const express = require('express');
const multer = require('multer');
const {
  createEvent,
  getEventsByMakerSpaceName,
  getEventsByMakerSpaceNames,
  updateEvent,
} = require('../Controller/eventController');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/', upload.array('images', 10), createEvent); // Create a new event
router.get('/by-makerspace/:makerspace', getEventsByMakerSpaceName); // Get events by makerspace name
router.post('/by-makerspaces', getEventsByMakerSpaceNames); // Get events by multiple makerspace names
router.put('/:id', upload.array('images', 10), updateEvent); // Update an event by ID

module.exports = router;