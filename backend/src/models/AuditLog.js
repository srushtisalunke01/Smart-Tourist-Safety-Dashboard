const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  action: {
    type: String,
    required: true
  },
  resource: {
    type: String,
    required: true
  },
  details: {
    type: String,
    required: true
  },
  ipAddress: String,
  userAgent: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Indexing frequently queried fields for high-performance aggregations
AuditLogSchema.index({ userId: 1, action: 1 });
AuditLogSchema.index({ timestamp: -1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
