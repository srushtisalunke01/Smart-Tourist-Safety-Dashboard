const express = require('express');
const router = express.Router();
const ScamReport = require('../models/ScamReport');
const AuditLog = require('../models/AuditLog');
const AIService = require('../services/ai.service');
const { authenticateToken, isAdmin } = require('../middlewares/auth');
const { getIO } = require('../config/socket');

router.post('/', authenticateToken, async (req, res) => {
  console.log('[Controller] createScamReport execution started');
  const { category, description, address, lat, lng, imageUrl } = req.body;
  try {
    const report = new ScamReport({
      user: req.user.id,
      category,
      description,
      address,
      lat,
      lng,
      imageUrl
    });
    console.log('[Database] Attempting to save new ScamReport...');
    await report.save();
    console.log(`[Database] ScamReport successfully saved. ID: ${report._id}`);
    
    // Broadcast via socket
    const io = getIO();
    if (io) {
      io.emit('new_scam_report', report);
      console.log('[Socket] Emitted new_scam_report');
    }
    
    console.log('[Response] Sending 201 Created');
    res.status(201).json(report);
  } catch (error) {
    console.error('[Error] createScamReport failed:', error.message);
    res.status(500).json({ message: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const reports = await ScamReport.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/hotspots', async (req, res) => {
  try {
    const reports = await ScamReport.find({ status: 'verified' });
    const hotspots = AIService.detectScamHotspots(reports);
    res.json(hotspots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/verify', authenticateToken, isAdmin, async (req, res) => {
  try {
    const report = await ScamReport.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    
    // Log the audit trail
    await AuditLog.create({
      userId: req.user.id,
      action: 'Verify',
      resource: 'ScamReport',
      details: `Scam report ${req.params.id} verification status changed to ${req.body.status}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
