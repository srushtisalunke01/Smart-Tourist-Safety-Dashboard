const settingsService = require('../services/settingsService');

class SettingsController {
  async getSettings(req, res, next) {
    try {
      const settings = await settingsService.getSettingsByUser(req.user.id);
      res.json(settings);
    } catch (err) {
      next(err);
    }
  }

  async updateSettings(req, res, next) {
    try {
      const settings = await settingsService.updateSettings(req.user.id, req.body);
      res.json(settings);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new SettingsController();
