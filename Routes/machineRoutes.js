const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  createMachine,
  getMachinesByMakerSpaceName,
  getMachinesByMakerSpaceNames,
  updateMachine,
} = require('../Controller/machineController');

const storage = multer.memoryStorage(); // Store files in memory for S3 upload
const upload = multer({ storage });
 // Configure multer for file uploads

// Routes
router.post('/add', upload.array('images', 10), createMachine); // Create a new machine
router.get('/by-makerspace/:makerspace', getMachinesByMakerSpaceName); // Get machines by makerspace name
router.post('/by-makerspaces', getMachinesByMakerSpaceNames); // Get machines by multiple makerspace names
router.put('/:id', upload.array('images', 10), updateMachine); // Update a machine by ID

module.exports = router;