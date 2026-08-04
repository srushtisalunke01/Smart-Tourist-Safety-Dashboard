const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');
const { authenticateToken, isAdmin } = require('../middlewares/auth');
const { getIO } = require('../config/socket');

router.get('/', async (req, res) => {
  try {
    const alerts = await Alert.find({ active: true }).sort({ createdAt: -1 });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const alert = new Alert(req.body);
    await alert.save();
    
    const io = getIO();
    if (io) {
      io.emit('new_global_alert', alert);
    }
    
    res.status(201).json(alert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
