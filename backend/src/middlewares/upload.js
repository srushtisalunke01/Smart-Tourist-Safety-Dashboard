const multer = require('multer');
const cloudinary = require('../config/cloudinary');

// Setup multer memory storage (stores file as buffer in memory)
const storage = multer.memoryStorage();

// File filter to allow only image files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB limit
  }
});

/**
 * Uploads a file buffer to Cloudinary or falls back to a base64 Data URL
 * @param {Object} file - The file object from Multer
 * @returns {Promise<string>} - The uploaded image URL
 */
const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    // Check if Cloudinary is configured
    const isConfigured = 
      process.env.CLOUDINARY_CLOUD_NAME && 
      process.env.CLOUDINARY_API_KEY && 
      process.env.CLOUDINARY_API_SECRET;

    if (!isConfigured) {
      // Fallback: Convert file buffer to base64 Data URL
      console.log('[Upload Service] Cloudinary credentials missing. Falling back to local Base64 URL.');
      const base64Data = file.buffer.toString('base64');
      const dataUrl = `data:${file.mimetype};base64,${base64Data}`;
      return resolve(dataUrl);
    }

    // Cloudinary Upload Stream
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'safetour',
        resource_type: 'auto'
      },
      (error, result) => {
        if (error) {
          console.error('[Cloudinary Upload Error]', error);
          // Fallback to base64 on API error to prevent blocking users
          const base64Data = file.buffer.toString('base64');
          const dataUrl = `data:${file.mimetype};base64,${base64Data}`;
          return resolve(dataUrl);
        }
        resolve(result.secure_url);
      }
    );

    // End stream by writing buffer
    uploadStream.end(file.buffer);
  });
};

module.exports = {
  upload,
  uploadToCloudinary
};
