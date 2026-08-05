const BaseRepository = require('./BaseRepository');
const Bookmark = require('../models/Bookmark');

class BookmarkRepository extends BaseRepository {
  constructor() {
    super(Bookmark);
  }
}

module.exports = new BookmarkRepository();
