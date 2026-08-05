const mongoose = require('mongoose');

const TouristReportSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  temp: String,
  condition: String,
  safetyScore: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  advisory: String,
  riskLevel: {
    type: String,
    enum: ['Safe', 'Moderate Risk', 'High Risk'],
    default: 'Safe'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('TouristReport', TouristReportSchema);
