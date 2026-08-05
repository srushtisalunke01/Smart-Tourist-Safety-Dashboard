const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  nationality: String,
  phoneNumber: String,
  address: String,
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
  blockchainID: {
    userHash: String,
    transactionHash: String,
    blockNumber: Number,
    verifiedAt: Date
  },
  preferences: {
    theme: { type: String, default: 'dark' },
    language: { type: String, default: 'en' }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Profile', ProfileSchema);
