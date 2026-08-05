const express = require('express');
const router = express.Router();
const womenSafetyController = require('../controllers/womenSafety.controller');
const { authenticateToken } = require('../middlewares/auth');

router.get('/', authenticateToken, womenSafetyController.getSafetyData);
router.post('/silent-sos', authenticateToken, womenSafetyController.addSilentSOS);
router.post('/tracking', authenticateToken, womenSafetyController.updateFamilyTracking);
router.put('/', authenticateToken, womenSafetyController.updateSafetyData);

module.exports = router;
