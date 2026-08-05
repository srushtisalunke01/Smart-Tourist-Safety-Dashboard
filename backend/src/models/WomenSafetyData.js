const mongoose = require('mongoose');

const WomenSafetyDataSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  safeCorridors: [
    {
      name: String,
      lat: Number,
      lng: Number
    }
  ],
  silentSOSLogs: [
    {
      lat: Number,
      lng: Number,
      timestamp: { type: Date, default: Date.now }
    }
  ],
  familyTracking: {
    active: { type: Boolean, default: false },
    trackingLink: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('WomenSafetyData', WomenSafetyDataSchema);
