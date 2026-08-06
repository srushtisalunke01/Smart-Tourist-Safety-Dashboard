const express = require('express');
const router = express.Router();
const likeController = require('../controllers/like.controller');
const { authenticateToken } = require('../middlewares/auth');

router.get('/', authenticateToken, likeController.getAllLikes);
router.post('/', authenticateToken, likeController.toggleLike);
router.delete('/:id', authenticateToken, likeController.deleteLike);

module.exports = router;

