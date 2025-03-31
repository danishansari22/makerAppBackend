// makerAppBackend/Models/machineModel.js
const mongoose = require('mongoose');

const machineSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    brandName: { type: String, required: true },
    modelNumber: { type: String, required: true },
    pricePerHour: { type: Number, required: true },
    bookableTimings: {
        start: { type: Date, required: true },
        end: { type: Date, required: true }
    },
    images: [{ type: String }],
    technicalDetails: { type: String, required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true }
});

const Machine = mongoose.model('Machine', machineSchema);

module.exports = Machine;