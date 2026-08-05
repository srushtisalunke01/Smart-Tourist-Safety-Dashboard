const express = require('express');
const router = express.Router();
const touristReportController = require('../controllers/touristReport.controller');
const { authenticateToken, isAdmin } = require('../middlewares/auth');

router.get('/', touristReportController.getAllReports);
router.get('/:id', touristReportController.getReportById);
router.post('/', authenticateToken, isAdmin, touristReportController.createReport);
router.put('/:id', authenticateToken, isAdmin, touristReportController.updateReport);
router.delete('/:id', authenticateToken, isAdmin, touristReportController.deleteReport);

module.exports = router;
