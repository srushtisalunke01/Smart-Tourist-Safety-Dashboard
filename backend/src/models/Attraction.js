const mongoose = require('mongoose');

const AttractionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  lat: {
    type: Number,
    required: true
  },
  lng: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    enum: ['Historical', 'Nature', 'Adventure', 'Religious', 'Cultural', 'Beaches'],
    required: true
  },
  ecoScore: {
    type: Number, // Carbon footprint/environment rating from 1 to 10
    default: 8
  },
  qrCodeToken: {
    type: String,
    required: true,
    unique: true
  },
  reviewsCount: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 4.5
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Attraction', AttractionSchema);
