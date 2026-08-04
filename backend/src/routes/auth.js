const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { authenticateToken } = require('../middlewares/auth');
const { sendMail } = require('../services/mail.service');

const JWT_SECRET = process.env.JWT_SECRET || 'safetour_secret_key_12345';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'safetour_refresh_secret_key_67890';

// Register Route
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: (role || 'tourist').toLowerCase(),
      emergencyContacts: []
    });

    await user.save();

    // Log the audit trail
    await AuditLog.create({
      userId: user._id,
      action: 'Register',
      resource: 'User',
      details: `User registration success for ${user.email}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    // Queue welcome email asynchronously in the background via BullMQ / SMTP
    sendMail({
      to: user.email,
      subject: 'Welcome to SafeTour AI!',
      text: `Hello ${user.name},\n\nThank you for joining SafeTour AI. We are dedicated to keeping your travels safe.`,
      html: `<h3>Hello ${user.name},</h3><p>Thank you for joining SafeTour AI. We are dedicated to keeping your travels safe.</p>`
    });

    const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user._id, role: user.role, name: user.name }, REFRESH_SECRET, { expiresIn: '7d' });

    // Store refresh token in cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        emergencyContacts: user.emergencyContacts, 
        savedPlaces: user.savedPlaces 
      } 
    });
  } catch (error) {
    console.error('[Register Error]', error);
    res.status(500).json({ message: error.message });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ message: 'Invalid email or password' });

    // Log the audit trail
    await AuditLog.create({
      userId: user._id,
      action: 'Login',
      resource: 'User',
      details: `Successful login for user ${user.email}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user._id, role: user.role, name: user.name }, REFRESH_SECRET, { expiresIn: '7d' });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        emergencyContacts: user.emergencyContacts, 
        savedPlaces: user.savedPlaces 
      } 
    });
  } catch (error) {
    console.error('[Login Error]', error);
    res.status(500).json({ message: error.message });
  }
});

// Google Auth Route (Mock)
router.post('/google', async (req, res) => {
  const { email, name, googleId } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      const dummyPassword = await bcrypt.hash(googleId || 'google_auth_dummy_12345', 10);
      user = new User({
        name,
        email,
        password: dummyPassword,
        role: 'tourist'
      });
      await user.save();
    }

    const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user._id, role: user.role, name: user.name }, REFRESH_SECRET, { expiresIn: '7d' });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        emergencyContacts: user.emergencyContacts, 
        savedPlaces: user.savedPlaces 
      } 
    });
  } catch (error) {
    console.error('[Google Auth Error]', error);
    res.status(500).json({ message: error.message });
  }
});

// Refresh Token Route
router.post('/refresh-token', async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ message: 'Refresh Token not found' });

  try {
    jwt.verify(refreshToken, REFRESH_SECRET, (err, user) => {
      if (err) return res.status(403).json({ message: 'Invalid or expired refresh token' });
      const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '15m' });
      res.json({ token });
    });
  } catch (error) {
    console.error('[Refresh Token Error]', error);
    res.status(500).json({ message: error.message });
  }
});

// Get User Profile Route
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('[Get Profile Error]', error);
    res.status(500).json({ message: error.message });
  }
});

// Update Contacts Route
router.put('/contacts', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { emergencyContacts: req.body.contacts },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    console.error('[Update Contacts Error]', error);
    res.status(500).json({ message: error.message });
  }
});

// Update Saved Places Route
router.put('/places', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { savedPlaces: req.body.savedPlaces },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    console.error('[Update Places Error]', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
