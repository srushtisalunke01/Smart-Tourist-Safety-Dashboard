const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['info', 'warning', 'critical'],
    default: 'warning'
  },
  category: {
    type: String,
    enum: ['Weather', 'Disaster', 'Crime', 'Road Closure', 'Advisory'],
    required: true
  },
  lat: Number,
  lng: Number,
  radius: Number, // In meters, if regional
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Alert', AlertSchema);
