const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  budget: {
    type: Number,
    required: true
  },
  days: {
    type: Number,
    required: true
  },
  interests: [String],
  travelStyle: String,
  groupType: String,
  transportation: String,
  itinerary: [
    {
      day: Number,
      theme: String,
      activities: [
        {
          time: String,
          activity: String,
          location: String,
          description: String,
          cost: Number
        }
      ]
    }
  ],
  budgetBreakdown: {
    accommodation: Number,
    activities: Number,
    food: Number,
    transport: Number,
    emergency: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Trip', TripSchema);
