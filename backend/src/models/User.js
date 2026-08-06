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
    enum: ['tourist', 'admin', 'police', 'hospital', 'rescue', 'moderator'],
    default: 'tourist'
  },
  emailVerified: {
    type: Boolean,
    default: false
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
  touristProfile: {
    nationality: String,
    blockchainID: {
      userHash: String,
      transactionHash: String,
      blockNumber: Number,
      verifiedAt: String
    }
  },
  policeProfile: {
    stationName: String,
    badgeNumber: String
  },
  hospitalProfile: {
    hospitalName: String,
    address: String,
    contactNumber: String
  },
  rescueProfile: {
    teamName: String,
    specialty: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

UserSchema.index({ role: 1 });
UserSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', UserSchema);

