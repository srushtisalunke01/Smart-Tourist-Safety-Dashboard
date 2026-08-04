const mongoose = require('mongoose');

const SafetyZoneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  lat: {
    type: Number,
    required: true
  },
  lng: {
    type: Number,
    required: true
  },
  radius: {
    type: Number,
    default: 1000 // In meters
  },
  safetyScore: {
    type: Number, // 0 to 100
    required: true
  },
  crimeIndex: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Low'
  },
  crowdDensity: {
    type: String,
    enum: ['Low', 'Moderate', 'Dense'],
    default: 'Moderate'
  },
  advisory: String,
  riskLevel: {
    type: String,
    enum: ['Safe', 'Moderate Risk', 'High Risk'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SafetyZone', SafetyZoneSchema);
