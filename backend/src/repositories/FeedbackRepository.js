const BaseRepository = require('./BaseRepository');
const Feedback = require('../models/Feedback');

class FeedbackRepository extends BaseRepository {
  constructor() {
    super(Feedback);
  }
}

module.exports = new FeedbackRepository();
