// FILE: makerAppBackend/Models/vendorModel.js

const mongoose = require('mongoose');

const VendorSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  contact: { type: String, required: true },
  type: { type: String, required: true },
  purposes: { type: [String], required: true },
  address: {
    city: { type: String, required: true },
    state: { type: String, required: true },
    address: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true },
    orgName: { type: String },
    orgEmail: { type: String },
  },
  spaceDetails: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    contact: { type: String, required: true },
    inchargeName: { type: String, required: true },
    website: { type: String, required: true },
    timings: {
      from: { type: String, required: true },
      to: { type: String, required: true },
    },
    daysOpen: { type: [String], required: true },
  },
  media: {
    images: { type: [String] },
    spaceLogo: { type: String },
    orgLogo: { type: String },
  },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  resetToken: String,
  resetTokenExpiry: Date,
});

module.exports = mongoose.model('Vendor', VendorSchema);