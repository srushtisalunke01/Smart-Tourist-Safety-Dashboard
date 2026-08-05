const BaseRepository = require('./BaseRepository');
const Profile = require('../models/Profile');

class ProfileRepository extends BaseRepository {
  constructor() {
    super(Profile);
  }
}

module.exports = new ProfileRepository();
