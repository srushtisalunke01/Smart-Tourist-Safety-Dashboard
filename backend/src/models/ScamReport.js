const mongoose = require('mongoose');

const ScamReportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['Fake Guide', 'Overcharging', 'Fraud', 'Pickpocketing', 'Unsafe Location', 'Fake Taxi', 'Other'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  address: String,
  lat: {
    type: Number,
    required: true
  },
  lng: {
    type: Number,
    required: true
  },
  imageUrl: String,
  status: {
    type: String,
    enum: ['pending', 'verified', 'dismissed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ScamReport', ScamReportSchema);
