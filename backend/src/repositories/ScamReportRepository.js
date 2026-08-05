const BaseRepository = require('./BaseRepository');
const ScamReport = require('../models/ScamReport');

class ScamReportRepository extends BaseRepository {
  constructor() {
    super(ScamReport);
  }
}

module.exports = new ScamReportRepository();
