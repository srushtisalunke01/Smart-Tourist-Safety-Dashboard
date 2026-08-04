const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const os = require('os');
const { isRedisConnected } = require('../config/redis');
const { getIO } = require('../config/socket');

router.get('/', (req, res) => {
  const memoryUsage = process.memoryUsage();
  
  // Get active socket clients count safely
  let connectedClients = 0;
  const io = getIO();
  if (io && io.sockets && io.sockets.sockets) {
    connectedClients = io.sockets.sockets.size;
  }

  const healthData = {
    status: 'healthy',
    timestamp: new Date(),
    uptime: `${Math.floor(process.uptime())}s`,
    system: {
      platform: process.platform,
      arch: process.arch,
      cpus: os.cpus().length,
      freeMemory: `${Math.floor(os.freemem() / 1024 / 1024)} MB`,
      totalMemory: `${Math.floor(os.totalmem() / 1024 / 1024)} MB`
    },
    process: {
      memory: {
        rss: `${Math.floor(memoryUsage.rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.floor(memoryUsage.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.floor(memoryUsage.heapUsed / 1024 / 1024)} MB`
      },
      cpu: process.cpuUsage()
    },
    databases: {
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      redis: isRedisConnected() ? 'connected' : 'disconnected'
    },
    sockets: {
      connectedClients
    }
  };

  res.json(healthData);
});

module.exports = router;
