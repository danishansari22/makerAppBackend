const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    firstName: { type: String,  },
    lastName: { type: String, },
    displayName: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    mobile: { type: String, },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    location: {
        country: { type: String },
        state: { type: String }
    },
    organization: {
        name: { type: String },
        type: { type: String, enum: ['University', 'Company'] }
    },
    userType: { type: String, },
    industry: { type: String, },
    skills: [{ type: String }],
    role: { type: String },
    links: {
        website: { type: String },
        linkedin: { type: String },
        twitter: { type: String },
        github: { type: String }
    },
    purpose: { type: String,  },
    image: { type: String },
    emailVerified: { type: Date },
    resetToken: String,
    resetTokenExpiry: Date,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

UserSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('User', UserSchema);