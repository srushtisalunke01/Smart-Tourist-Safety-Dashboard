const express = require('express');
const router = express.Router();
const Dispatch = require('../models/Dispatch');
const { authenticateToken } = require('../middlewares/auth');
const { getIO } = require('../config/socket');

// Fetch active dispatches for the authenticated responder role
router.get('/active', authenticateToken, async (req, res) => {
  try {
    const userRole = req.user.role.toLowerCase();
    let query = { status: { $ne: 'Completed' } };

    // If not admin, filter dispatches specifically assigned to this responder's role
    if (userRole !== 'admin') {
      query.responderRole = userRole;
    }

    const dispatches = await Dispatch.find(query)
      .populate({
        path: 'sosRequest',
        populate: {
          path: 'user',
          select: 'name phone email emergencyContacts'
        }
      })
      .sort({ dispatchedAt: -1 });

    res.json(dispatches);
  } catch (error) {
    console.error('[Get Active Dispatches Error]', error);
    res.status(500).json({ message: error.message });
  }
});

// Update status of a specific dispatch
router.put('/:id/status', authenticateToken, async (req, res) => {
  const { status } = req.body;
  try {
    const dispatch = await Dispatch.findById(req.params.id);
    if (!dispatch) {
      return res.status(404).json({ message: 'Dispatch not found' });
    }

    dispatch.status = status;
    if (status === 'Completed') {
      dispatch.resolvedAt = new Date();
    }

    await dispatch.save();

    const populatedDispatch = await Dispatch.findById(dispatch._id)
      .populate({
        path: 'sosRequest',
        populate: {
          path: 'user',
          select: 'name phone email emergencyContacts'
        }
      });

    // Emit live WebSocket update to all active responders
    const io = getIO();
    if (io) {
      io.emit('dispatch_status_update', populatedDispatch);
    }

    // Auto-resolve underlying SOS request if all dispatches for it are completed
    if (status === 'Completed') {
      const SOSRequest = require('../models/SOSRequest');
      const activeDispatchesCount = await Dispatch.countDocuments({
        sosRequest: dispatch.sosRequest,
        status: { $ne: 'Completed' }
      });

      if (activeDispatchesCount === 0) {
        const sosReq = await SOSRequest.findByIdAndUpdate(
          dispatch.sosRequest,
          { status: 'resolved', resolvedAt: new Date(), resolvedBy: req.user.id },
          { new: true }
        );
        if (io && sosReq) {
          io.emit('sos_resolved', sosReq._id);
        }
      }
    }

    res.json(populatedDispatch);
  } catch (error) {
    console.error('[Update Dispatch Status Error]', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
