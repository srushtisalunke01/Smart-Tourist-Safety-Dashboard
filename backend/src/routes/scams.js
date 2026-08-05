const express = require('express');
const router = express.Router();
const scamController = require('../controllers/scam.controller');
const { authenticateToken, isAdmin } = require('../middlewares/auth');
const { upload } = require('../middlewares/upload');

router.get('/', scamController.getAllReports);
router.get('/hotspots', scamController.getHotspots);
router.get('/:id', scamController.getReportById);
router.post('/', authenticateToken, upload.single('image'), scamController.createReport);
router.put('/:id/verify', authenticateToken, isAdmin, scamController.verifyReport);
router.delete('/:id', authenticateToken, isAdmin, scamController.deleteReport);

module.exports = router;
