const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/UserRepository');
const PendingUser = require('../models/PendingUser');
const AuditLog = require('../models/AuditLog');
const { sendOtpEmail } = require('../services/mail.service');

const JWT_SECRET = process.env.JWT_SECRET || 'safetour_secret_key_12345';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'safetour_refresh_secret_key_67890';

class AuthController {
  // Step 1: Initiate Sign Up -> Generate OTP, store in PendingUsers, send Email
  async register(req, res, next) {
    const { name, email, password, role } = req.body;
    try {
      const normalizedEmail = email.toLowerCase().trim();

      // Check if user already exists in permanent Users collection
      const existingUser = await userRepository.findOne({ email: normalizedEmail });
      if (existingUser) {
        if (!existingUser.emailVerified) {
          return res.status(400).json({ 
            message: 'An unverified account exists with this email. Please click resend OTP or log in.', 
            unverified: true,
            email: normalizedEmail 
          });
        }
        return res.status(400).json({ message: 'An account with this email already exists.' });
      }

      // Hash password and OTP
      const hashedPassword = await bcrypt.hash(password, 10);
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const hashedOtp = await bcrypt.hash(otpCode, 10);
      const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

      // Save or update temporary PendingUser record
      await PendingUser.findOneAndDelete({ email: normalizedEmail });

      await PendingUser.create({
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role: (role || 'tourist').toLowerCase(),
        hashedOtp,
        otpExpiry,
        attempts: 0,
        lastResendAt: new Date()
      });

      console.log(`[OTP DEBUG] Sent Verification OTP ${otpCode} to ${normalizedEmail}`);

      // Dispatch HTML Email
      sendOtpEmail(name, normalizedEmail, otpCode).catch(err => {
        console.error('[OTP Mail Error]', err);
      });

      res.status(200).json({
        message: 'Verification security code sent to your email.',
        email: normalizedEmail,
        requiresVerification: true
      });
    } catch (err) {
      next(err);
    }
  }

  // Step 2: Verify 6-digit OTP -> Create User in Users Collection -> Issue JWT
  async verifyOtp(req, res, next) {
    const { email, otp } = req.body;
    try {
      if (!email || !otp) {
        return res.status(400).json({ message: 'Email and OTP code are required.' });
      }

      const normalizedEmail = email.toLowerCase().trim();
      const pending = await PendingUser.findOne({ email: normalizedEmail });

      if (!pending) {
        // Check if user is already verified
        const existing = await userRepository.findOne({ email: normalizedEmail });
        if (existing && existing.emailVerified) {
          return res.status(400).json({ message: 'Your email is already verified. Please sign in.' });
        }
        return res.status(400).json({ message: 'Verification session expired. Please register again.' });
      }

      // Check OTP Expiration
      if (new Date() > new Date(pending.otpExpiry)) {
        return res.status(400).json({ message: 'OTP expired. Please request a new code.', expired: true });
      }

      // Compare Hashed OTP
      const isMatch = await bcrypt.compare(otp.trim(), pending.hashedOtp);
      if (!isMatch) {
        pending.attempts += 1;
        await pending.save();
        return res.status(400).json({ message: 'Invalid OTP code. Please check your email and try again.' });
      }

      // Create Permanent Verified User in MongoDB Atlas
      const user = await userRepository.create({
        name: pending.name,
        email: pending.email,
        password: pending.password,
        role: pending.role,
        emailVerified: true,
        emergencyContacts: []
      });

      // Cleanup Temporary Pending Record
      await PendingUser.deleteOne({ _id: pending._id });

      // Audit Log
      await AuditLog.create({
        userId: user._id,
        action: 'Register_Verified',
        resource: 'User',
        details: `User email verified & registered for ${user.email}`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      // Generate JWT Tokens
      const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '15m' });
      const refreshToken = jwt.sign({ id: user._id, role: user.role, name: user.name }, REFRESH_SECRET, { expiresIn: '7d' });

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
          emailVerified: user.emailVerified,
          emergencyContacts: user.emergencyContacts,
          savedPlaces: user.savedPlaces
        }
      });
    } catch (err) {
      next(err);
    }
  }

  // Step 3: Resend OTP Code -> Rate Limit 60s & Max 5 Attempts
  async resendOtp(req, res, next) {
    const { email } = req.body;
    try {
      if (!email) return res.status(400).json({ message: 'Email address is required.' });

      const normalizedEmail = email.toLowerCase().trim();
      const pending = await PendingUser.findOne({ email: normalizedEmail });

      if (!pending) {
        return res.status(400).json({ message: 'Verification session expired. Please register again.' });
      }

      // Max 5 resend attempts limit
      if (pending.attempts >= 5) {
        return res.status(429).json({ message: 'Maximum resend limit reached (5 attempts). Please register again.' });
      }

      // 60-second cooldown between resend requests
      const secondsSinceLast = (new Date() - new Date(pending.lastResendAt)) / 1000;
      if (secondsSinceLast < 60) {
        const remaining = Math.ceil(60 - secondsSinceLast);
        return res.status(429).json({ message: `Please wait ${remaining} seconds before requesting a new OTP.` });
      }

      // Generate New 6-digit OTP
      const newOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const hashedOtp = await bcrypt.hash(newOtpCode, 10);

      pending.hashedOtp = hashedOtp;
      pending.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
      pending.lastResendAt = new Date();
      pending.attempts += 1;
      await pending.save();

      console.log(`[OTP DEBUG] Resent OTP ${newOtpCode} to ${normalizedEmail}`);

      sendOtpEmail(pending.name, normalizedEmail, newOtpCode).catch(err => {
        console.error('[OTP Resend Mail Error]', err);
      });

      res.status(200).json({ message: 'New verification OTP sent to your email.' });
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    const { email, password } = req.body;
    try {
      const normalizedEmail = email.toLowerCase().trim();
      const user = await userRepository.findOne({ email: normalizedEmail });

      if (!user) {
        // Check if registration is pending verification
        const pending = await PendingUser.findOne({ email: normalizedEmail });
        if (pending) {
          return res.status(403).json({
            message: 'Please verify your email first before logging in.',
            unverified: true,
            email: normalizedEmail
          });
        }
        return res.status(400).json({ message: 'Invalid email or password' });
      }

      // Block login for unverified emails
      if (user.emailVerified === false) {
        return res.status(403).json({
          message: 'Please verify your email first before logging in.',
          unverified: true,
          email: normalizedEmail
        });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) return res.status(400).json({ message: 'Invalid email or password' });

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
          emailVerified: user.emailVerified,
          emergencyContacts: user.emergencyContacts,
          savedPlaces: user.savedPlaces
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async google(req, res, next) {
    const { email, name, googleId } = req.body;
    try {
      const normalizedEmail = email.toLowerCase().trim();
      let user = await userRepository.findOne({ email: normalizedEmail });

      if (!user) {
        const dummyPassword = await bcrypt.hash(googleId || 'google_auth_dummy_12345', 10);
        user = await userRepository.create({
          name,
          email: normalizedEmail,
          password: dummyPassword,
          role: 'tourist',
          emailVerified: true
        });
      } else if (!user.emailVerified) {
        user.emailVerified = true;
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
          emailVerified: user.emailVerified,
          emergencyContacts: user.emergencyContacts,
          savedPlaces: user.savedPlaces
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async refreshToken(req, res, next) {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: 'Refresh Token not found' });

    try {
      jwt.verify(refreshToken, REFRESH_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid or expired refresh token' });
        const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '15m' });
        res.json({ token });
      });
    } catch (err) {
      next(err);
    }
  }

  async getMe(req, res, next) {
    try {
      const user = await userRepository.findById(req.user.id);
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json(user);
    } catch (err) {
      next(err);
    }
  }

  async updateContacts(req, res, next) {
    try {
      const user = await userRepository.update(req.user.id, { emergencyContacts: req.body.contacts });
      res.json(user);
    } catch (err) {
      next(err);
    }
  }

  async updatePlaces(req, res, next) {
    try {
      const user = await userRepository.update(req.user.id, { savedPlaces: req.body.savedPlaces });
      res.json(user);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
