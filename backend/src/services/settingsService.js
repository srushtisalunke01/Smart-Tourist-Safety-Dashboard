const settingsRepository = require('../repositories/SettingsRepository');

class SettingsService {
  async getSettingsByUser(userId) {
    let settings = await settingsRepository.findOne({ user: userId });
    if (!settings) {
      settings = await settingsRepository.create({ user: userId });
    }
    return settings;
  }

  async updateSettings(userId, data) {
    let settings = await settingsRepository.findOne({ user: userId });
    if (!settings) {
      return settingsRepository.create({ user: userId, ...data });
    }
    return settingsRepository.update(settings._id, data);
  }
}

module.exports = new SettingsService();
