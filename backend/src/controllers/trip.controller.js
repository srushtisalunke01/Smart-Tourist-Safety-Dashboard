const tripService = require('../services/tripService');
const AIService = require('../services/ai.service');

class TripController {
  async getAllTrips(req, res, next) {
    try {
      const trips = await tripService.getTripsByUser(req.user.id);
      res.json(trips);
    } catch (err) {
      next(err);
    }
  }

  async getTripById(req, res, next) {
    try {
      const trip = await tripService.getTripById(req.params.id);
      if (!trip) return res.status(404).json({ message: 'Trip not found' });
      res.json(trip);
    } catch (err) {
      next(err);
    }
  }

  async generateTripPlan(req, res, next) {
    try {
      const plan = await AIService.generateTripPlan(req.body);
      const trip = await tripService.createTrip({
        user: req.user.id,
        destination: plan.destination,
        budget: req.body.budget,
        days: req.body.days,
        interests: req.body.interests,
        travelStyle: req.body.travelStyle,
        groupType: req.body.groupType,
        transportation: req.body.transportation,
        itinerary: plan.itinerary,
        budgetBreakdown: plan.budgetBreakdown
      });
      res.status(201).json({ trip, details: plan });
    } catch (err) {
      next(err);
    }
  }

  async createTrip(req, res, next) {
    try {
      const trip = await tripService.createTrip({ user: req.user.id, ...req.body });
      res.status(201).json(trip);
    } catch (err) {
      next(err);
    }
  }

  async updateTrip(req, res, next) {
    try {
      const trip = await tripService.updateTrip(req.params.id, req.body);
      if (!trip) return res.status(404).json({ message: 'Trip not found' });
      res.json(trip);
    } catch (err) {
      next(err);
    }
  }

  async deleteTrip(req, res, next) {
    try {
      const trip = await tripService.deleteTrip(req.params.id);
      if (!trip) return res.status(404).json({ message: 'Trip not found' });
      res.json({ message: 'Trip deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new TripController();
