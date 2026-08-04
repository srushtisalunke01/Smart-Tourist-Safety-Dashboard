const express = require('express');
const router = express.Router();
const SOSRequest = require('../models/SOSRequest');
const AuditLog = require('../models/AuditLog');
const { authenticateToken } = require('../middlewares/auth');
const { getIO } = require('../config/socket');

// Trigger emergency SOS
router.post('/', authenticateToken, async (req, res) => {
  console.log('[Controller] triggerSOS execution started');
  const { lat, lng } = req.body;
  try {
    const request = new SOSRequest({
      user: req.user.id,
      lat,
      lng
    });
    console.log('[Database] Attempting to save new SOSRequest...');
    await request.save();
    console.log(`[Database] SOSRequest successfully saved. ID: ${request._id}`);

    const populated = await SOSRequest.findById(request._id)
      .populate('user', 'name phone email emergencyContacts');

    // Broadcast emergency signal to admins, rescue teams, police, etc.
    const io = getIO();
    if (io) {
      io.emit('sos_alert', populated);
    }

    // Write database notifications for all admin/police/hospital/rescue users
    try {
      const User = require('../models/User');
      const Notification = require('../models/Notification');
      const responders = await User.find({ role: { $in: ['admin', 'police', 'hospital', 'rescue'] } });
      const notificationPromises = responders.map(responder => {
        return Notification.create({
          userId: responder._id,
          title: '🚨 EMERGENCY SOS ACTIVE',
          message: `Tourist ${populated.user?.name || 'Explorer'} triggered panic signal at [${lat}, ${lng}]!`,
          type: 'SOS',
          isRead: false
        });
      });
      await Promise.all(notificationPromises);
      
      // Also emit a real-time notification event to trigger bell badge updates
      if (io) {
        io.emit('new_db_notification', {
          title: '🚨 EMERGENCY SOS ACTIVE',
          type: 'SOS'
        });
      }
    } catch (notificationError) {
      console.error('[SOS Route] Failed to create notifications:', notificationError.message);
    }

    // Write audit log
    await AuditLog.create({
      userId: req.user.id,
      action: 'Create',
      resource: 'SOSRequest',
      details: `Emergency SOS triggered at [${lat}, ${lng}]`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get active SOS requests
router.get('/active', authenticateToken, async (req, res) => {
  try {
    const activeRequests = await SOSRequest.find({ status: 'active' })
      .populate('user', 'name email emergencyContacts')
      .sort({ createdAt: -1 });
    res.json(activeRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Resolve SOS Request
router.put('/:id/resolve', authenticateToken, async (req, res) => {
  try {
    const request = await SOSRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'resolved', resolvedAt: new Date(), resolvedBy: req.user.id },
      { new: true }
    );

    const io = getIO();
    if (io) {
      io.emit('sos_resolved', req.params.id);
    }

    // Log the audit trail
    await AuditLog.create({
      userId: req.user.id,
      action: 'Resolve',
      resource: 'SOSRequest',
      details: `Emergency SOS resolved for request ${req.params.id}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
