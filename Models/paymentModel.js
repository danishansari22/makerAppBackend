// create a paymet schema


const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    orderId: { type: String, required: true },
    paymentId: { type: String, required: true },
    signature: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;