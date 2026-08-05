const BaseRepository = require('./BaseRepository');
const SavedTrip = require('../models/SavedTrip');

class SavedTripRepository extends BaseRepository {
  constructor() {
    super(SavedTrip);
  }
}

module.exports = new SavedTripRepository();
