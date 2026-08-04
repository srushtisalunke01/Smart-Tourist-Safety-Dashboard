const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['tourist', 'admin', 'police', 'hospital', 'rescue'],
    default: 'tourist'
  },
  emergencyContacts: [
    {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      relationship: { type: String }
    }
  ],
  savedPlaces: [
    {
      name: String,
      address: String,
      lat: Number,
      lng: Number
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);
