const BaseRepository = require('./BaseRepository');
const WomenSafetyData = require('../models/WomenSafetyData');

class WomenSafetyDataRepository extends BaseRepository {
  constructor() {
    super(WomenSafetyData);
  }
}

module.exports = new WomenSafetyDataRepository();
