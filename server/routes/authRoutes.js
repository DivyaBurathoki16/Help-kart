import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import Provider from '../models/Provider.js';
import generateToken from '../utils/generateToken.js';
import { protect } from '../middleware/auth.js';
import { sendOTPEmail, sendWelcomeEmail } from '../utils/emailService.js';
import {
  generateOTP,
  hashOTP,
  verifyOTP,
  checkRateLimit,
  checkHourlyLimit,
} from '../utils/otpUtils.js';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['customer', 'provider']).withMessage('Role must be customer or provider').custom((value) => {
      if (value === 'admin') {
        throw new Error('Admin registration is not allowed');
      }
      return true;
    }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { name, email, password, role, phone } = req.body;

      // Check if user exists
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ success: false, message: 'User already exists' });
      }

      // Create user
      const user = await User.create({
        name,
        email,
        password,
        role,
        phone,
      });

      // If provider, create provider profile
      if (role === 'provider') {
        await Provider.create({
          user: user._id,
          businessName: name,
          phone: phone || '',
        });
      }

      // Send welcome email (don't block registration if email fails)
      try {
        await sendWelcomeEmail(email, name, role);
      } catch (error) {
        console.error('Error sending welcome email:', error);
        // Continue with registration even if email fails
      }

      // Generate token
      const token = generateToken(user._id);

      res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { email, password } = req.body;

      // Admin login with fixed credentials
      if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
        let adminUser = await User.findOne({ email: process.env.ADMIN_EMAIL });
        
        if (!adminUser) {
          // Create admin user if doesn't exist
          adminUser = await User.create({
            name: 'Admin',
            email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASSWORD,
            role: 'admin',
          });
        } else {
          // Update role to admin if not already
          if (adminUser.role !== 'admin') {
            adminUser.role = 'admin';
            await adminUser.save();
          }
        }

        const token = generateToken(adminUser._id);
        return res.json({
          success: true,
          token,
          user: {
            id: adminUser._id,
            name: adminUser.name,
            email: adminUser.email,
            role: adminUser.role,
          },
        });
      }

      // Regular user login - Generate OTP
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      // Prevent admin registration through normal login
      if (user.role === 'admin' && email !== process.env.ADMIN_EMAIL) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      // Check if user is active and not blocked
      if (!user.isActive || user.isBlocked) {
        return res.status(401).json({ success: false, message: 'Account is blocked or inactive' });
      }

      // Check password
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      // Rate limiting: Check cooldown period (60 seconds between requests)
      const rateLimitCheck = checkRateLimit(user.lastOtpSentAt, 60);
      if (!rateLimitCheck.allowed) {
        return res.status(429).json({
          success: false,
          message: `Please wait ${rateLimitCheck.remainingSeconds} seconds before requesting a new OTP.`,
        });
      }

      // Rate limiting: Check hourly limit (max 5 OTPs per hour)
      const hourlyLimitCheck = checkHourlyLimit(user.otpHistory, 5);
      if (!hourlyLimitCheck.allowed) {
        return res.status(429).json({
          success: false,
          message: 'Too many OTP requests. Please try again after an hour.',
        });
      }

      // Generate cryptographically secure OTP (6 digits)
      const otp = generateOTP();
      // Hash OTP before storing (security best practice)
      const hashedOtp = hashOTP(otp);
      user.otp = hashedOtp;
      user.otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes
      user.otpAttempts = 0; // Reset attempts when new OTP is generated
      user.lastOtpSentAt = new Date();
      // Add to history for hourly limit tracking
      user.otpHistory = [...(user.otpHistory || []), new Date()].slice(-10); // Keep last 10 entries
      await user.save();

      // Send OTP email
      try {
        await sendOTPEmail(user.email, otp, 'login');
      } catch (error) {
        console.error('Error sending OTP email:', error);
        // Clear OTP if email fails
        user.otp = null;
        user.otpExpiry = null;
        user.otpAttempts = 0;
        await user.save();
        return res.status(500).json({ success: false, message: 'Failed to send OTP email. Please try again.' });
      }

      res.json({
        success: true,
        message: 'OTP sent to your email. Please check your inbox.',
        email: user.email,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and complete login
// @access  Public
router.post(
  '/verify-otp',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { email, otp } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // Check if OTP exists and is not expired
      if (!user.otp || !user.otpExpiry || user.otpExpiry < Date.now()) {
        return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
      }

      // Check attempt limit (max 5 attempts per OTP)
      if (user.otpAttempts >= 5) {
        // Invalidate OTP after max attempts
        user.otp = null;
        user.otpExpiry = null;
        user.otpAttempts = 0;
        await user.save();
        return res.status(400).json({
          success: false,
          message: 'Too many failed attempts. Please request a new OTP.',
          otpLocked: true,
          errorCode: 'OTP_ATTEMPTS_EXCEEDED',
        });
      }

      // Verify OTP using hashed comparison (timing-safe)
      const isValid = verifyOTP(otp, user.otp);
      if (!isValid) {
        // Increment attempt counter
        user.otpAttempts = (user.otpAttempts || 0) + 1;
        await user.save();
        const remainingAttempts = 5 - user.otpAttempts;
        
        // Check if this was the last attempt
        if (user.otpAttempts >= 5) {
          // Invalidate OTP after max attempts
          user.otp = null;
          user.otpExpiry = null;
          user.otpAttempts = 0;
          await user.save();
          return res.status(400).json({
            success: false,
            message: 'Too many failed attempts. Please request a new OTP.',
            otpLocked: true,
            errorCode: 'OTP_ATTEMPTS_EXCEEDED',
          });
        }
        
        return res.status(400).json({
          success: false,
          message: `Invalid OTP. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.`,
          otpLocked: false,
          remainingAttempts,
          errorCode: 'INVALID_OTP',
        });
      }

      // OTP verified successfully - Clear OTP and reset attempts
      user.otp = null;
      user.otpExpiry = null;
      user.otpAttempts = 0;
      await user.save();

      // Generate token
      const token = generateToken(user._id);

      res.json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// @route   POST /api/auth/forgot-password
// @desc    Send password reset OTP
// @access  Public
router.post(
  '/forgot-password',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        // Don't reveal if user exists for security
        return res.json({ success: true, message: 'If the email exists, a password reset OTP has been sent.' });
      }

      // Rate limiting: Check cooldown period (60 seconds between requests)
      const rateLimitCheck = checkRateLimit(user.lastResetOtpSentAt, 60);
      if (!rateLimitCheck.allowed) {
        // Don't reveal if user exists - return same message
        return res.json({
          success: true,
          message: 'If the email exists, a password reset OTP has been sent.',
        });
      }

      // Rate limiting: Check hourly limit (max 5 OTPs per hour)
      const hourlyLimitCheck = checkHourlyLimit(user.resetOtpHistory, 5);
      if (!hourlyLimitCheck.allowed) {
        // Don't reveal if user exists - return same message
        return res.json({
          success: true,
          message: 'If the email exists, a password reset OTP has been sent.',
        });
      }

      // Generate cryptographically secure reset OTP (6 digits)
      const resetOtp = generateOTP();
      // Hash OTP before storing (security best practice)
      const hashedResetOtp = hashOTP(resetOtp);
      user.resetOtp = hashedResetOtp;
      user.resetOtpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
      user.resetOtpAttempts = 0; // Reset attempts when new OTP is generated
      user.lastResetOtpSentAt = new Date();
      // Add to history for hourly limit tracking
      user.resetOtpHistory = [...(user.resetOtpHistory || []), new Date()].slice(-10); // Keep last 10 entries
      await user.save();

      // Send reset OTP email
      try {
        await sendOTPEmail(user.email, resetOtp, 'reset');
      } catch (error) {
        console.error('Error sending reset OTP email:', error);
        // Clear OTP if email fails
        user.resetOtp = null;
        user.resetOtpExpiry = null;
        user.resetOtpAttempts = 0;
        await user.save();
        return res.status(500).json({ success: false, message: 'Failed to send reset OTP email. Please try again.' });
      }

      res.json({ success: true, message: 'Password reset OTP sent to your email.' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// @route   POST /api/auth/reset-password
// @desc    Reset password with OTP
// @access  Public
router.post(
  '/reset-password',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { email, otp, newPassword } = req.body;

      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // Check if OTP exists and is not expired
      if (!user.resetOtp || !user.resetOtpExpiry || user.resetOtpExpiry < Date.now()) {
        return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
      }

      // Check attempt limit (max 5 attempts per OTP)
      if (user.resetOtpAttempts >= 5) {
        // Invalidate OTP after max attempts
        user.resetOtp = null;
        user.resetOtpExpiry = null;
        user.resetOtpAttempts = 0;
        await user.save();
        return res.status(400).json({
          success: false,
          message: 'Too many failed attempts. Please request a new OTP.',
          otpLocked: true,
          errorCode: 'OTP_ATTEMPTS_EXCEEDED',
        });
      }

      // Verify OTP using hashed comparison (timing-safe)
      const isValid = verifyOTP(otp, user.resetOtp);
      if (!isValid) {
        // Increment attempt counter
        user.resetOtpAttempts = (user.resetOtpAttempts || 0) + 1;
        await user.save();
        const remainingAttempts = 5 - user.resetOtpAttempts;
        
        // Check if this was the last attempt
        if (user.resetOtpAttempts >= 5) {
          // Invalidate OTP after max attempts
          user.resetOtp = null;
          user.resetOtpExpiry = null;
          user.resetOtpAttempts = 0;
          await user.save();
          return res.status(400).json({
            success: false,
            message: 'Too many failed attempts. Please request a new OTP.',
            otpLocked: true,
            errorCode: 'OTP_ATTEMPTS_EXCEEDED',
          });
        }
        
        return res.status(400).json({
          success: false,
          message: `Invalid OTP. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.`,
          otpLocked: false,
          remainingAttempts,
          errorCode: 'INVALID_OTP',
        });
      }

      // OTP verified successfully - Update password and clear OTP
      user.password = newPassword; // Will be hashed by pre-save hook
      user.resetOtp = null;
      user.resetOtpExpiry = null;
      user.resetOtpAttempts = 0;
      await user.save();

      res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PATCH /api/auth/profile
// @desc    Update user profile (including location for customers)
// @access  Private
router.patch('/profile', protect, async (req, res) => {
  try {
    const { name, phone, location } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update allowed fields
    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (location !== undefined) user.location = location;

    await user.save();

    const updatedUser = await User.findById(req.user._id).select('-password');
    res.json({ success: true, user: updatedUser, message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
