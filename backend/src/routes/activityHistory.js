const express = require('express');
const router = express.Router();
const activityHistoryController = require('../controllers/activityHistory.controller');
const { authenticateToken } = require('../middlewares/auth');

router.get('/', authenticateToken, activityHistoryController.getActivities);
router.post('/', authenticateToken, activityHistoryController.logActivity);
router.delete('/:id', authenticateToken, activityHistoryController.deleteActivity);

module.exports = router;
