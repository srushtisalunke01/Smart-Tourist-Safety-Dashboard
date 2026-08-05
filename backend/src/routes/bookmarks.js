const express = require('express');
const router = express.Router();
const bookmarkController = require('../controllers/bookmark.controller');
const { authenticateToken } = require('../middlewares/auth');

router.get('/', authenticateToken, bookmarkController.getBookmarks);
router.post('/', authenticateToken, bookmarkController.addBookmark);
router.post('/remove', authenticateToken, bookmarkController.removeBookmark);

module.exports = router;
