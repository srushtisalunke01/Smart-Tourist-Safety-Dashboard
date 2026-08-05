const BaseRepository = require('./BaseRepository');
const TouristReport = require('../models/TouristReport');

class TouristReportRepository extends BaseRepository {
  constructor() {
    super(TouristReport);
  }
}

module.exports = new TouristReportRepository();
