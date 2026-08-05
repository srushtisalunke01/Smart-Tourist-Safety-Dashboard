const BaseRepository = require('./BaseRepository');
const CommunityPost = require('../models/CommunityPost');

class CommunityPostRepository extends BaseRepository {
  constructor() {
    super(CommunityPost);
  }
}

module.exports = new CommunityPostRepository();
