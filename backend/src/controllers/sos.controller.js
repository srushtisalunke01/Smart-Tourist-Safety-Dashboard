const sosService = require('../services/sosService');
const AuditLog = require('../models/AuditLog');
const Dispatch = require('../models/Dispatch');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { getIO } = require('../config/socket');

class SOSController {
  async getAllSOS(req, res, next) {
    try {
      const logs = await sosService.getAllSOS();
      res.json(logs);
    } catch (err) {
      next(err);
    }
  }

  async getActiveSOS(req, res, next) {
    try {
      const active = await sosService.getActiveSOS();
      res.json(active);
    } catch (err) {
      next(err);
    }
  }

  async triggerSOS(req, res, next) {
    const { lat, lng } = req.body;
    try {
      const request = await sosService.createSOS(req.user.id, lat, lng);
      
      const populated = await sosService.getActiveSOS().then(list => list.find(s => s._id.toString() === request._id.toString()));

      // Auto-create dispatch records
      try {
        await Dispatch.insertMany([
          { sosRequest: request._id, responderRole: 'police' },
          { sosRequest: request._id, responderRole: 'hospital' },
          { sosRequest: request._id, responderRole: 'rescue' }
        ]);
      } catch (dispatchErr) {
        console.error('[SOS Controller] Failed to auto-create Dispatch records:', dispatchErr.message);
      }

      // Broadcast emergency signal
      const io = getIO();
      if (io) {
        io.emit('sos_alert', populated || request);
      }

      // Write database notifications for all responders
      try {
        const responders = await User.find({ role: { $in: ['admin', 'police', 'hospital', 'rescue'] } });
        const notificationPromises = responders.map(responder => {
          return Notification.create({
            userId: responder._id,
            title: '🚨 EMERGENCY SOS ACTIVE',
            message: `Tourist ${populated?.user?.name || 'Explorer'} triggered panic signal at [${lat}, ${lng}]!`,
            type: 'SOS',
            isRead: false
          });
        });
        await Promise.all(notificationPromises);
        
        if (io) {
          io.emit('new_db_notification', {
            title: '🚨 EMERGENCY SOS ACTIVE',
            type: 'SOS'
          });
        }
      } catch (notificationError) {
        console.error('[SOS Controller] Failed to create notifications:', notificationError.message);
      }

      // Audit Log
      await AuditLog.create({
        userId: req.user.id,
        action: 'Create',
        resource: 'SOSRequest',
        details: `Emergency SOS triggered at [${lat}, ${lng}]`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      res.status(201).json(populated || request);
    } catch (err) {
      next(err);
    }
  }

  async resolveSOS(req, res, next) {
    try {
      const request = await sosService.resolveSOS(req.params.id, req.user.id);
      
      const io = getIO();
      if (io) {
        io.emit('sos_resolved', req.params.id);
      }

      await AuditLog.create({
        userId: req.user.id,
        action: 'Resolve',
        resource: 'SOSRequest',
        details: `Emergency SOS resolved for request ${req.params.id}`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      res.json(request);
    } catch (err) {
      next(err);
    }
  }

  async deleteSOS(req, res, next) {
    try {
      await sosService.deleteSOS(req.params.id);
      res.json({ message: 'SOS log deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new SOSController();
