const express = require('express');
const router = express.Router();
const savedTripController = require('../controllers/savedTrip.controller');
const { authenticateToken } = require('../middlewares/auth');

router.get('/', authenticateToken, savedTripController.getSavedTrips);
router.post('/', authenticateToken, savedTripController.saveTrip);
router.delete('/:tripId', authenticateToken, savedTripController.unsaveTrip);

module.exports = router;
