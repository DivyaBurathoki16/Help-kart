import crypto from 'crypto';

/**
 * Hash OTP using SHA-256
 * This prevents OTP from being readable if database is compromised
 */
export const hashOTP = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

/**
 * Verify OTP by comparing hashed values
 */
export const verifyOTP = (inputOtp, hashedOtp) => {
  const hashedInput = hashOTP(inputOtp);
  return crypto.timingSafeEqual(
    Buffer.from(hashedInput),
    Buffer.from(hashedOtp)
  );
};

/**
 * Generate a cryptographically secure 6-digit OTP
 */
export const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Check if enough time has passed since last OTP request (rate limiting)
 * @param {Date} lastOtpSentAt - Timestamp of last OTP sent
 * @param {number} cooldownSeconds - Minimum seconds between requests (default: 60)
 * @returns {Object} { allowed: boolean, remainingSeconds: number }
 */
export const checkRateLimit = (lastOtpSentAt, cooldownSeconds = 60) => {
  if (!lastOtpSentAt) {
    return { allowed: true, remainingSeconds: 0 };
  }

  const now = Date.now();
  const elapsed = Math.floor((now - lastOtpSentAt.getTime()) / 1000);
  const remaining = cooldownSeconds - elapsed;

  if (remaining > 0) {
    return { allowed: false, remainingSeconds: remaining };
  }

  return { allowed: true, remainingSeconds: 0 };
};

/**
 * Check if user has exceeded hourly OTP limit
 * @param {Array} otpHistory - Array of timestamps when OTPs were sent
 * @param {number} maxPerHour - Maximum OTPs allowed per hour (default: 5)
 * @returns {Object} { allowed: boolean, count: number }
 */
export const checkHourlyLimit = (otpHistory = [], maxPerHour = 5) => {
  if (!Array.isArray(otpHistory) || otpHistory.length === 0) {
    return { allowed: true, count: 0 };
  }

  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  const recentOtps = otpHistory.filter((timestamp) => {
    // Handle both Date objects and timestamp numbers/strings
    const timestampMs =
      timestamp instanceof Date
        ? timestamp.getTime()
        : new Date(timestamp).getTime();
    return timestampMs > oneHourAgo;
  });

  if (recentOtps.length >= maxPerHour) {
    return { allowed: false, count: recentOtps.length };
  }

  return { allowed: true, count: recentOtps.length };
};
