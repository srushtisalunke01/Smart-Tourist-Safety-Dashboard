const bookmarkRepository = require('../repositories/BookmarkRepository');

class BookmarkService {
  async getBookmarksByUser(userId) {
    return bookmarkRepository.find({ user: userId });
  }

  async addBookmark(userId, targetType, targetId) {
    const existing = await bookmarkRepository.findOne({ user: userId, targetType, targetId });
    if (existing) return existing;
    return bookmarkRepository.create({ user: userId, targetType, targetId });
  }

  async removeBookmark(userId, targetType, targetId) {
    return bookmarkRepository.deleteMany({ user: userId, targetType, targetId });
  }
}

module.exports = new BookmarkService();
