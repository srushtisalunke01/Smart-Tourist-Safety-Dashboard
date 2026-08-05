const express = require('express');
const router = express.Router();
const TouristLocation = require('../models/TouristLocation');
const { authenticateToken } = require('../middlewares/auth');

router.get('/locations', authenticateToken, async (req, res, next) => {
  try {
    const locations = await TouristLocation.find()
      .populate('user', 'name phone email role touristProfile')
      .sort({ timestamp: -1 });
    res.json(locations);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
