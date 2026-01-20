import express from 'express';
import multer from 'multer';
import path from 'path';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Configure storage for memory (Base64 conversion)
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
});

// Helper to convert buffer to Base64
const bufferToBase64 = (mimetype, buffer) => {
  return `data:${mimetype};base64,${buffer.toString('base64')}`;
};

// @route   POST /api/upload/service-images
// @desc    Upload service images (PROVIDER ONLY) - Returns Base64 strings
// @access  Private/Provider
router.post('/service-images', protect, authorize('provider'), upload.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const imageUrls = req.files.map((file) => {
      // Convert to Base64 string for DB storage
      return bufferToBase64(file.mimetype, file.buffer);
    });

    res.json({
      success: true,
      images: imageUrls,
      message: `${req.files.length} image(s) uploaded successfully`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/upload/issue-images
// @desc    Upload issue/proof/review images (CUSTOMER & PROVIDER) - Returns Base64 strings
// @access  Private/Customer/Provider
router.post('/issue-images', protect, authorize('customer', 'provider'), upload.array('images', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const imageUrls = req.files.map((file) => {
      // Convert to Base64 string for DB storage
      return bufferToBase64(file.mimetype, file.buffer);
    });

    res.json({
      success: true,
      images: imageUrls,
      message: `${req.files.length} image(s) uploaded successfully`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
