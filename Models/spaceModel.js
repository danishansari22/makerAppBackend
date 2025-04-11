const mongoose = require('mongoose');

const mentorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  designation: { type: String, required: true },
  linkedin: { type: String, required: true },
  image: { type: String, required: true },
});

const seatingSchema = new mongoose.Schema({
  category: { type: String, required: true },
  room: { type: String, required: true },
  seats: { type: Number, required: true },
});

const howToReachSchema = new mongoose.Schema({
  airport: { type: String },
  railway: { type: String },
  metro: { type: String },
  bus: { type: String },
});

const makerspaceSchema = new mongoose.Schema({
  id: { type: String, unique: true, required:false },
  type: { type: String},
  usage: [{ type: String }],
  name: { type: String },
  description: { type: String },
  email: { type: String, required: true },
  number: { type: String },
  inChargeName: { type: String },
  websiteLink: { type: String},
  timings: {
    monday: { type: String},
    tuesday: { type: String },
    wednesday: { type: String },
    thursday: { type: String},
    friday: { type: String },
    saturday: { type: String },
    sunday: { type: String},
  },
  city: { type: String},
  state: { type: String},
  address: { type: String },
  zipcode: { type: String},
  country: { type: String},
  organizationName: { type: String },
  organizationEmail: { type: String },
  imageLinks: [{ type: String }],
  logoImageLinks: [{ type: String }],
  googleMapLink: { type: String },
  howToReach: howToReachSchema,
  amenities: [{ type: String }],
  mentors: [mentorSchema],
  instructions: [{ type: String}],
  additionalInformation: { type: String},
  rating: { type: Number },
  status: { type: String},
  seating: [seatingSchema],
  createdAt: { type: Date, default: Date.now },
  token: { type: String },
});

// export default mongoose.model('Makerspace', makerspaceSchema);
module.exports = mongoose.model('Makerspace', makerspaceSchema);