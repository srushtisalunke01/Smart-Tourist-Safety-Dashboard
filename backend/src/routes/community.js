const express = require('express');
const router = express.Router();
const communityController = require('../controllers/community.controller');
const { authenticateToken } = require('../middlewares/auth');
const { validate } = require('../middlewares/validation');

// Compatibility paths
router.get('/', communityController.getAllPosts);
router.get('/posts', communityController.getAllPosts);
router.get('/:id', communityController.getPostById);
router.get('/posts/:id', communityController.getPostById);

router.post('/', authenticateToken, validate(['title', 'content', 'location']), communityController.createPost);
router.post('/posts', authenticateToken, validate(['title', 'content', 'location']), communityController.createPost);

router.put('/:id', authenticateToken, communityController.updatePost);
router.put('/posts/:id', authenticateToken, communityController.updatePost);

router.delete('/:id', authenticateToken, communityController.deletePost);
router.delete('/posts/:id', authenticateToken, communityController.deletePost);

router.post('/:id/like', authenticateToken, communityController.likePost);
router.post('/posts/:id/like', authenticateToken, communityController.likePost);

router.post('/:id/comment', authenticateToken, communityController.commentOnPost);
router.post('/posts/:id/comment', authenticateToken, communityController.commentOnPost);

module.exports = router;
