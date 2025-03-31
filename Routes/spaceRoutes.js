const express = require('express');
const multer = require('multer');
const { createSpace, getAllSpaces, getSpaceById, updateSpace, deleteSpace } = require('../Controller/spaceController.js');

const router = express.Router();

// Configure multer to handle file uploads
const storage = multer.memoryStorage(); // Store files in memory for S3 upload
const upload = multer({ storage });

router.post('/create', upload.array('images', 10), createSpace); // Allow up to 10 images
router.get('/', getAllSpaces);
router.get('/:id', getSpaceById);
router.put('/:id', updateSpace);
router.delete('/:id', deleteSpace);

module.exports = router;