const BaseRepository = require('./BaseRepository');
const SOSRequest = require('../models/SOSRequest');

class SOSRequestRepository extends BaseRepository {
  constructor() {
    super(SOSRequest);
  }
}

module.exports = new SOSRequestRepository();
