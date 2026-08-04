const mongoose = require('mongoose');

const LocationHistorySchema = new mongoose.Schema({
  lat: Number,
  lng: Number,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const TouristLocationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  lat: {
    type: Number,
    required: true
  },
  lng: {
    type: Number,
    required: true
  },
  speed: Number,
  bearing: Number,
  batteryLevel: Number,
  status: {
    type: String,
    enum: ['Safe', 'Moderate Risk', 'High Risk', 'SOS'],
    default: 'Safe'
  },
  history: [LocationHistorySchema],
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Create spatial/location indexes
TouristLocationSchema.index({ lat: 1, lng: 1 });
TouristLocationSchema.index({ status: 1 });

// Middleware to automatically push to history on updates
TouristLocationSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  if (update && update.lat !== undefined && update.lng !== undefined) {
    this.findOneAndUpdate({}, {
      $push: {
        history: {
          $each: [{ lat: update.lat, lng: update.lng, timestamp: new Date() }],
          $slice: -50 // Keep only last 50 historical points to prevent document bloating
        }
      }
    });
  }
  next();
});

module.exports = mongoose.model('TouristLocation', TouristLocationSchema);
