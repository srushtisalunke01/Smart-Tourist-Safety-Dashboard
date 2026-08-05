const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedback.controller');
const { authenticateToken, isAdmin } = require('../middlewares/auth');

router.get('/', authenticateToken, isAdmin, feedbackController.getAllFeedback);
router.post('/', feedbackController.submitFeedback);
router.delete('/:id', authenticateToken, isAdmin, feedbackController.deleteFeedback);

module.exports = router;
