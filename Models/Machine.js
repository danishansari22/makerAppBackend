const mongoose = require('mongoose');

const inChargeSchema = new mongoose.Schema({
  name: { type: String, },
  number: { type: String, },
});

const timeSchema = new mongoose.Schema({
  start: { type: String,  },
  end: { type: String,  },
});

const machineSchema = new mongoose.Schema({
  category: { type: String, },
  brand: { type: String,},
  model: { type: String,},
  price: { type: Number, },
  time: { type: timeSchema, },
  imageLinks: [{ type: String }],
  description: { type: String,  },
  location: { type: String, },
  instruction: { type: String,  },
  inCharge: [inChargeSchema],
  makerSpace: { type: mongoose.Schema.Types.ObjectId,
    ref: 'MakerSpace' },
    makerSpaceName: { type: String, },
  status: { type: String,  },
  rating: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Machine', machineSchema);
