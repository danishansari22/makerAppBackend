const express = require('express');
const router = express.Router();

const {createOrder,verifyPayment} = require('../Controller/paymentController');

router.post('/createOrder', createOrder);
router.post('/verifyPayment', verifyPayment);

module.exports = router;
