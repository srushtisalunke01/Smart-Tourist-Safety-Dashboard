const offlineCacheService = require('../services/offlineCacheService');

class OfflineCacheController {
  async getCache(req, res, next) {
    try {
      const logs = await offlineCacheService.getCacheByUser(req.user.id);
      res.json(logs);
    } catch (err) {
      next(err);
    }
  }

  async saveCacheLog(req, res, next) {
    const { packageId, packageName, packageSize } = req.body;
    try {
      const log = await offlineCacheService.saveCacheLog(req.user.id, packageId, packageName, packageSize);
      res.status(201).json(log);
    } catch (err) {
      next(err);
    }
  }

  async clearCacheLog(req, res, next) {
    const { packageId } = req.body;
    try {
      const log = await offlineCacheService.clearCacheLog(req.user.id, packageId);
      res.json(log);
    } catch (err) {
      next(err);
    }
  }

  async deleteCacheLog(req, res, next) {
    try {
      await offlineCacheService.deleteCacheLog(req.params.id);
      res.json({ message: 'Offline cache log deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new OfflineCacheController();
