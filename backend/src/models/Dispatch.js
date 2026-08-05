const mongoose = require('mongoose');

const DispatchSchema = new mongoose.Schema({
  sosRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SOSRequest',
    required: true
  },
  responderRole: {
    type: String,
    enum: ['police', 'hospital', 'rescue'],
    required: true
  },
  status: {
    type: String,
    enum: ['Dispatched', 'EnRoute', 'OnScene', 'Completed'],
    default: 'Dispatched'
  },
  dispatchedAt: {
    type: Date,
    default: Date.now
  },
  resolvedAt: Date
});

module.exports = mongoose.model('Dispatch', DispatchSchema);
