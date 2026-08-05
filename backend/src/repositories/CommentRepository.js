const BaseRepository = require('./BaseRepository');
const Comment = require('../models/Comment');

class CommentRepository extends BaseRepository {
  constructor() {
    super(Comment);
  }
}

module.exports = new CommentRepository();
