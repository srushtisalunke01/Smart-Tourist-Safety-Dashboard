const express = require('express');
const router = express.Router();
const Trip = require('../models/Trip');
const AIService = require('../services/ai.service');
const { authenticateToken } = require('../middlewares/auth');

router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const plan = await AIService.generateTripPlan(req.body);
    const trip = new Trip({
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
    await trip.save();
    res.status(201).json({ trip, details: plan });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const trips = await Trip.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
