const express = require('express');
const router = express.Router();
const sosController = require('../controllers/sos.controller');
const { authenticateToken } = require('../middlewares/auth');
const { validate } = require('../middlewares/validation');

router.get('/', authenticateToken, sosController.getAllSOS);
router.get('/active', authenticateToken, sosController.getActiveSOS);
router.post('/', authenticateToken, validate(['lat', 'lng']), sosController.triggerSOS);
router.put('/:id/resolve', authenticateToken, sosController.resolveSOS);
router.delete('/:id', authenticateToken, sosController.deleteSOS);

module.exports = router;
