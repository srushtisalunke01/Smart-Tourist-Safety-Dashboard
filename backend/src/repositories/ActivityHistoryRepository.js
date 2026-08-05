const BaseRepository = require('./BaseRepository');
const ActivityHistory = require('../models/ActivityHistory');

class ActivityHistoryRepository extends BaseRepository {
  constructor() {
    super(ActivityHistory);
  }
}

module.exports = new ActivityHistoryRepository();
