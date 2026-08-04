const socketIo = require('socket.io');

let io = null;

const initSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Live location tracking update event
    socket.on('update_location', async (data) => {
      try {
        const { userId, lat, lng, speed, bearing, batteryLevel, status } = data;
        if (!userId) return;

        const timestamp = new Date();

        // Broadcast the telemetry metrics in real-time to all command consoles
        io.emit('location_update', {
          userId,
          lat: Number(lat),
          lng: Number(lng),
          speed: speed ? Number(speed) : null,
          bearing: bearing ? Number(bearing) : null,
          batteryLevel: batteryLevel ? Number(batteryLevel) : null,
          status: status || 'Safe',
          timestamp
        });

        // Asynchronously update the Mongoose database
        const TouristLocation = require('../models/TouristLocation');
        await TouristLocation.findOneAndUpdate(
          { user: userId },
          {
            lat: Number(lat),
            lng: Number(lng),
            speed: speed ? Number(speed) : null,
            bearing: bearing ? Number(bearing) : null,
            batteryLevel: batteryLevel ? Number(batteryLevel) : null,
            status: status || 'Safe',
            timestamp
          },
          { upsert: true, new: true }
        );
      } catch (err) {
        console.error(`[Socket] Location tracking error: ${err.message}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  return io;
};

module.exports = {
  initSocket,
  getIO
};
