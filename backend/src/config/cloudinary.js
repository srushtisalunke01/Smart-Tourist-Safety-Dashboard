const cloudinary = require('cloudinary').v2;

// Check if credentials are present, otherwise log a warning
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.warn('[Cloudinary] WARNING: Cloudinary credentials are not completely defined in .env. Uploads will fallback to local storage or memory base64 logs.');
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'mock_cloud',
  api_key: process.env.CLOUDINARY_API_KEY || 'mock_key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'mock_secret'
});

module.exports = cloudinary;
