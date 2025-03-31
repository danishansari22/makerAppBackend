const Razorpay = require('razorpay');
const { v4: uuidv4 } = require('uuid');
const Machine = require('../Models/machineModel');
const User = require('../Models/userModel');
const Payment = require('../Models/paymentModel');


const crypto = require('crypto');
const { log } = require('console');
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

module.exports.createOrder = async (req, res) => {
    try {
        const {hour,machineId,email} = req.body;
        console.log(hour,machineId,email);
        const user = await User.findOne({ email });
        const machine = await Machine.findById(machineId);
        if (!machine) {
            return res.status(404).json({ message: 'Machine not found' });
        }
        const amount = machine.pricePerHour * hour;
        const options = {
            amount: amount * 100,
            currency: "INR",
            receipt: uuidv4(),
        };
        const order = await razorpay.orders.create(options).then((order) => {
            const newPayment = new Payment({
                orderId: order.id,
                paymentId: "not paid",
                signature: "not verified",
                amount,
                userId: user._id,
                status: 'created'
            });
            newPayment.save();
            console.log(order);
            
        }
        ).catch((error) => {
            console.log(error);
        }
        );
        res.status(201).json({order, message: 'Order created successfully' });


    }
    catch (error) {
        console.log(error);
        
        res.status(500).json({ message: 'Server error', error });
    }
}

module.exports.verifyPayment = async (req, res) => {
    try {
        const { order_id, payment_id, signature } = req.body;
        const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
        shasum.update(`${order_id}|${payment_id}`);
        const digest = shasum.digest('hex');
        if (digest === signature) {
            
            const payment = await Payment.findOne({ orderId: order_id });
            payment.paymentId = payment_id;
            payment.signature = signature;
            payment.status = 'success';
            await payment.save();
            res.json({ message: 'Payment successfull' });
        }
        else {
            res.status(400).json({ message: 'Payment verification failed' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }

}


