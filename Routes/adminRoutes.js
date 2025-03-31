// makerAppBackend/Routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../Controller/adminController');

router.post('/generate-onboarding-link', adminController.generateOnboardingLink);
router.get('/to-be-onboarded', adminController.getToBeOnboardedList);

module.exports = router;