const mongoose = require('mongoose');

const ActivityHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true
  },
  details: String,
  ipAddress: String,
  userAgent: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

ActivityHistorySchema.index({ user: 1, timestamp: -1 });

module.exports = mongoose.model('ActivityHistory', ActivityHistorySchema);
