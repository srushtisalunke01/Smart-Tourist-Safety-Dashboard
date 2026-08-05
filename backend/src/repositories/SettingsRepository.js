const BaseRepository = require('./BaseRepository');
const Settings = require('../models/Settings');

class SettingsRepository extends BaseRepository {
  constructor() {
    super(Settings);
  }
}

module.exports = new SettingsRepository();
