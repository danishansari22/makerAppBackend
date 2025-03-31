// makerAppBackend/Models/bookingModel.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    machineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Machine', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    price: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    VendorAproval: { type: Boolean, default: false }
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;