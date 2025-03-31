const express = require('express');
const multer = require('multer');
const { createMakerspace,
    getMakerspaceByName,
    getMakerspacesByCity,
    getAllSpaces,
    getSpaceById,
    updateSpace,
    deleteSpace,
    onboardMakerspace,
    verifyOnboardingToken } = require('../Controller/spaceController.js');

const router = express.Router();

// Configure multer to handle file uploads
const storage = multer.memoryStorage(); // Store files in memory for S3 upload
const upload = multer({ storage });

router.post('/onboard', onboardMakerspace); // Generate onboarding link
router.get('/verify/:token', verifyOnboardingToken); // Verify onboarding token
router.post('/', upload.array('images', 10), createMakerspace); // Create a new makerspace
router.get('/:id', getSpaceById); // Get a makerspace by ID
router.put('/:id', upload.array('images', 10), updateSpace); // Update a makerspace
router.delete('/:id', deleteSpace); // Delete a makerspace
router.get('/by-name/:name', getMakerspaceByName); // Get a makerspace by name
router.get('/by-city/:city', getMakerspacesByCity);
router.get('/all', getAllSpaces); // Get all makerspaces

module.exports = router;