const activityHistoryRepository = require('../repositories/ActivityHistoryRepository');

class ActivityHistoryService {
  async getActivitiesByUser(userId) {
    return activityHistoryRepository.find({ user: userId }, { sort: { timestamp: -1 } });
  }

  async logActivity(userId, action, details, ipAddress = '', userAgent = '') {
    return activityHistoryRepository.create({
      user: userId,
      action,
      details,
      ipAddress,
      userAgent
    });
  }

  async deleteActivity(id) {
    return activityHistoryRepository.delete(id);
  }
}

module.exports = new ActivityHistoryService();
