const savedTripService = require('../services/savedTripService');

class SavedTripController {
  async getSavedTrips(req, res, next) {
    try {
      const trips = await savedTripService.getSavedTripsByUser(req.user.id);
      res.json(trips);
    } catch (err) {
      next(err);
    }
  }

  async saveTrip(req, res, next) {
    try {
      const saved = await savedTripService.saveTrip(req.user.id, req.body.tripId);
      res.status(201).json(saved);
    } catch (err) {
      next(err);
    }
  }

  async unsaveTrip(req, res, next) {
    try {
      await savedTripService.unsaveTrip(req.user.id, req.params.tripId);
      res.json({ message: 'Trip unsaved successfully' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new SavedTripController();
