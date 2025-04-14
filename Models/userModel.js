const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String },
  number: { type: String},
  usertype: [{ type: String }],
  industry: [{ type: String }],
  purpose: [{ type: String }],
  role: { type: String  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);