const express = require('express');
const router = express.Router();
const offlineCacheController = require('../controllers/offlineCache.controller');
const { authenticateToken } = require('../middlewares/auth');

router.get('/', authenticateToken, offlineCacheController.getCache);
router.post('/', authenticateToken, offlineCacheController.saveCacheLog);
router.post('/clear', authenticateToken, offlineCacheController.clearCacheLog);
router.delete('/:id', authenticateToken, offlineCacheController.deleteCacheLog);

module.exports = router;
