const mongoose = require('mongoose');
const dns = require('dns');

// Configure custom DNS resolution to prevent querySrv ECONNREFUSED issues with MongoDB Atlas on Windows/certain networks
dns.setServers([
  '1.1.1.1',
  '8.8.8.8'
]);

const connectDB = async () => {
  try {
    const connString = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/safetour';
    const maskedConn = connString.replace(/\/\/.*@/, '//<credentials>@');
    console.log(`[Database] Connecting to: ${maskedConn}`);
    const conn = await mongoose.connect(connString);
    console.log(`[Database] MongoDB Connected to host: ${conn.connection.host}, database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[Database] Mongoose Connection Error: ${error.message}`);
    // Print warning but don't crash dev server
    console.warn('[Database] Ensure MongoDB is running locally or MONGO_URI is set properly in .env');
  }
};

module.exports = connectDB;
