const feedbackRepository = require('../repositories/FeedbackRepository');

class FeedbackService {
  async getAllFeedback() {
    return feedbackRepository.find();
  }

  async getFeedbackById(id) {
    return feedbackRepository.findById(id);
  }

  async createFeedback(userId, name, email, message, rating) {
    return feedbackRepository.create({
      user: userId,
      name,
      email,
      message,
      rating
    });
  }

  async deleteFeedback(id) {
    return feedbackRepository.delete(id);
  }
}

module.exports = new FeedbackService();
