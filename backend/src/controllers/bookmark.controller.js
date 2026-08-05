const bookmarkService = require('../services/bookmarkService');

class BookmarkController {
  async getBookmarks(req, res, next) {
    try {
      const list = await bookmarkService.getBookmarksByUser(req.user.id);
      res.json(list);
    } catch (err) {
      next(err);
    }
  }

  async addBookmark(req, res, next) {
    const { targetType, targetId } = req.body;
    try {
      const bookmark = await bookmarkService.addBookmark(req.user.id, targetType, targetId);
      res.status(201).json(bookmark);
    } catch (err) {
      next(err);
    }
  }

  async removeBookmark(req, res, next) {
    const { targetType, targetId } = req.body;
    try {
      await bookmarkService.removeBookmark(req.user.id, targetType, targetId);
      res.json({ message: 'Bookmark removed successfully' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new BookmarkController();
