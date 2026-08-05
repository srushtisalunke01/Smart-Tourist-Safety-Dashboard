const express = require('express');
const router = express.Router();
const tripController = require('../controllers/trip.controller');
const { authenticateToken } = require('../middlewares/auth');
const { validate } = require('../middlewares/validation');

router.get('/', authenticateToken, tripController.getAllTrips);
router.get('/:id', authenticateToken, tripController.getTripById);
router.post('/generate', authenticateToken, validate(['destination', 'budget', 'days']), tripController.generateTripPlan);
router.post('/', authenticateToken, validate(['destination', 'budget', 'days']), tripController.createTrip);
router.put('/:id', authenticateToken, tripController.updateTrip);
router.delete('/:id', authenticateToken, tripController.deleteTrip);

module.exports = router;
