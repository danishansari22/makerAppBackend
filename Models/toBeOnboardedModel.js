const mongoose = require('mongoose');

const ToBeOnboardedSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  eventStartTime: { type: Date, required: true },
  eventEndTime: { type: Date, required: true },
  uniqueLink: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ToBeOnboarded', ToBeOnboardedSchema);