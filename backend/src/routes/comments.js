const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comment.controller');
const { authenticateToken } = require('../middlewares/auth');

router.get('/', authenticateToken, commentController.getAllComments);
router.post('/', authenticateToken, commentController.createComment);
router.put('/:id', authenticateToken, commentController.updateComment);
router.post('/:id/reply', authenticateToken, commentController.replyToComment);
router.delete('/:id', authenticateToken, commentController.deleteComment);

module.exports = router;
