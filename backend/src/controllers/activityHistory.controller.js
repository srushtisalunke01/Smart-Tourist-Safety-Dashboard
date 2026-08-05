const activityHistoryService = require('../services/activityHistoryService');

class ActivityHistoryController {
  async getActivities(req, res, next) {
    try {
      const logs = await activityHistoryService.getActivitiesByUser(req.user.id);
      res.json(logs);
    } catch (err) {
      next(err);
    }
  }

  async logActivity(req, res, next) {
    const { action, details } = req.body;
    try {
      const log = await activityHistoryService.logActivity(
        req.user.id,
        action,
        details,
        req.ip,
        req.headers['user-agent']
      );
      res.status(201).json(log);
    } catch (err) {
      next(err);
    }
  }

  async deleteActivity(req, res, next) {
    try {
      await activityHistoryService.deleteActivity(req.params.id);
      res.json({ message: 'Activity log deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ActivityHistoryController();
