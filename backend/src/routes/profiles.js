const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');
const { authenticateToken } = require('../middlewares/auth');

router.get('/', authenticateToken, profileController.getAllProfiles);
router.get('/me', authenticateToken, profileController.getProfile);
router.get('/:userId', authenticateToken, profileController.getProfile);
router.post('/', authenticateToken, profileController.createProfile);
router.post('/blockchain-verify', authenticateToken, profileController.verifyBlockchain);
router.put('/', authenticateToken, profileController.updateProfile);
router.put('/:userId', authenticateToken, profileController.updateProfile);
router.delete('/', authenticateToken, profileController.deleteProfile);

module.exports = router;
