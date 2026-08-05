const feedbackService = require('../services/feedbackService');

class FeedbackController {
  async getAllFeedback(req, res, next) {
    try {
      const feed = await feedbackService.getAllFeedback();
      res.json(feed);
    } catch (err) {
      next(err);
    }
  }

  async submitFeedback(req, res, next) {
    const { name, email, message, rating } = req.body;
    try {
      const feed = await feedbackService.createFeedback(
        req.user ? req.user.id : null,
        name,
        email,
        message,
        Number(rating)
      );
      res.status(201).json(feed);
    } catch (err) {
      next(err);
    }
  }

  async deleteFeedback(req, res, next) {
    try {
      await feedbackService.deleteFeedback(req.params.id);
      res.json({ message: 'Feedback deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new FeedbackController();
