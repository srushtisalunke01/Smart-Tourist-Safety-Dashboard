const BaseRepository = require('./BaseRepository');
const Like = require('../models/Like');

class LikeRepository extends BaseRepository {
  constructor() {
    super(Like);
  }
}

module.exports = new LikeRepository();
