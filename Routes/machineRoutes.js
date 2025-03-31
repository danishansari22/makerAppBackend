// makerAppBackend/Routes/machineRoutes.js
const express = require('express');
const router = express.Router();
const { addMachine, getMachines, bookMachine, getUserBookings, getVendorMachines, getVendorEarnings,getBookingCalender,getAvailableDatesForBooking,getSpecificMachine } = require('../Controller/machineController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/add', upload.array('images', 10), addMachine);
router.get('/', getMachines);
router.post('/book', bookMachine);
router.get('/user/:userId/bookings', getUserBookings);
router.get('/vendor/:vendorId/machines', getVendorMachines);
router.get('/vendor/:vendorId/earnings', getVendorEarnings);
router.get('/calender/:machineId', getAvailableDatesForBooking);
router.get('/:machineId', getSpecificMachine);



module.exports = router;