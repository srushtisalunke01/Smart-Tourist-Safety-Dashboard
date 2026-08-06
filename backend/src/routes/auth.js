const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middlewares/auth');
const { validate } = require('../middlewares/validation');

router.post('/register', validate(['name', 'email', 'password']), authController.register);
router.post('/verify-otp', validate(['email', 'otp']), authController.verifyOtp);
router.post('/resend-otp', validate(['email']), authController.resendOtp);
router.post('/login', validate(['email', 'password']), authController.login);
router.post('/google', validate(['email', 'name']), authController.google);
router.post('/refresh-token', authController.refreshToken);
router.get('/me', authenticateToken, authController.getMe);
router.put('/contacts', authenticateToken, validate(['contacts']), authController.updateContacts);
router.put('/places', authenticateToken, validate(['savedPlaces']), authController.updatePlaces);


module.exports = router;
