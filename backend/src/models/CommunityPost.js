const mongoose = require('mongoose');

const CommunityPostSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  location: String,
  safetyRating: {
    type: Number, // 1 to 5
    min: 1,
    max: 5,
    required: true
  },
  experienceRating: {
    type: Number, // 1 to 5
    min: 1,
    max: 5
  },
  imageUrl: String,
  likes: {
    type: Number,
    default: 0
  },
  comments: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      text: String,
      userName: String,
      createdAt: { type: Date, default: Date.now }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CommunityPost', CommunityPostSchema);
