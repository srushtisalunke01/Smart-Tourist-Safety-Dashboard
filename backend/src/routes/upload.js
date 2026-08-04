const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const { upload, uploadToCloudinary } = require('../middlewares/upload');

// Endpoint: POST /api/upload
// Uploads an image file and returns the accessible URL
router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded. Please supply an "image" field.' });
    }

    // Upload using helper (auto fallback to base64 if Cloudinary credentials missing)
    const url = await uploadToCloudinary(req.file);

    res.status(200).json({ 
      message: 'Upload successful', 
      url 
    });
  } catch (error) {
    console.error('[Upload Route Error]', error);
    res.status(500).json({ message: error.message || 'File upload failed' });
  }
});

module.exports = router;
