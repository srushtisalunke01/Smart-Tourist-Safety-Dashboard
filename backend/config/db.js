const mongoose = require('mongoose');
const dns = require('dns');

dns.setServers([
  '1.1.1.1',
  '8.8.8.8'
]);

const connectDB = async () => {
  try {
    const connString = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/safetour';
    const conn = await mongoose.connect(connString);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    // Do not crash the server in dev mode, print warning
    console.warn('Proceeding with database warning. Ensure MongoDB is running locally or MONGO_URI is set.');
  }
};

module.exports = connectDB;
