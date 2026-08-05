const mongoose = require('mongoose');

const OfflineCacheMetadataSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  packageId: {
    type: String,
    required: true
  },
  packageName: {
    type: String,
    required: true
  },
  packageSize: String,
  status: {
    type: String,
    enum: ['downloaded', 'cleared'],
    default: 'downloaded'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Avoid duplicate downloads log for same user & package
OfflineCacheMetadataSchema.index({ user: 1, packageId: 1 }, { unique: true });

module.exports = mongoose.model('OfflineCacheMetadata', OfflineCacheMetadataSchema);
