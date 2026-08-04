const express = require('express');
const router = express.Router();
const Attraction = require('../models/Attraction');
const { authenticateToken } = require('../middlewares/auth');

router.get('/', async (req, res) => {
  try {
    const attractions = await Attraction.find();
    res.json(attractions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/checkin', authenticateToken, async (req, res) => {
  const { qrCodeToken } = req.body;
  try {
    const attraction = await Attraction.findOne({ qrCodeToken });
    if (!attraction) return res.status(404).json({ message: 'Invalid QR Code. Attraction not found.' });

    res.json({
      message: `Checked in successfully at ${attraction.name}!`,
      attraction
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
