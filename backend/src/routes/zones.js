const express = require('express');
const router = express.Router();
const SafetyZone = require('../models/SafetyZone');
const { authenticateToken, isAdmin } = require('../middlewares/auth');

router.get('/', async (req, res) => {
  try {
    const zones = await SafetyZone.find();
    res.json(zones);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', authenticateToken, isAdmin, async (req, res) => {
  console.log('[Controller] createSafetyZone execution started');
  try {
    const scoreVal = req.body.safetyScore || 80;
    let riskLevel = 'Safe';
    if (scoreVal < 55) riskLevel = 'High Risk';
    else if (scoreVal < 80) riskLevel = 'Moderate Risk';

    const zone = new SafetyZone({
      ...req.body,
      riskLevel
    });
    
    console.log('[Database] Attempting to save new SafetyZone...');
    await zone.save();
    console.log(`[Database] SafetyZone successfully saved. ID: ${zone._id}`);
    
    console.log('[Response] Sending 201 Created');
    res.status(201).json(zone);
  } catch (error) {
    console.error('[Error] createSafetyZone failed:', error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
