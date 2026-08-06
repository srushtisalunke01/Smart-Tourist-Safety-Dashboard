const mongoose = require('mongoose');

const PendingUserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['tourist', 'admin', 'police', 'hospital', 'rescue', 'moderator'],
    default: 'tourist'
  },
  hashedOtp: {
    type: String,
    required: true
  },
  otpExpiry: {
    type: Date,
    required: true
  },
  attempts: {
    type: Number,
    default: 0
  },
  lastResendAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // Auto-delete document after 10 minutes (600s TTL)
  }
});

module.exports = mongoose.model('PendingUser', PendingUserSchema);
