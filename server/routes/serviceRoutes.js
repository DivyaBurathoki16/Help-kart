import express from 'express';
import Service from '../models/Service.js';
import Provider from '../models/Provider.js';
import Category from '../models/Category.js';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Helper function to get or create provider profile
const getOrCreateProvider = async (userId) => {
  let provider = await Provider.findOne({ user: userId });
  if (!provider) {
    // Get user to get their phone number
    const user = await User.findById(userId);
    // Auto-create a basic provider profile if it doesn't exist
    provider = await Provider.create({
      user: userId,
      businessName: user?.name || 'My Business',
      phone: user?.phone || '000-000-0000', // Use user's phone or default
    });
  }
  return provider;
};

// @route   POST /api/services
// @desc    Create a new service (PROVIDER ONLY)
// @access  Private/Provider
router.post('/', protect, authorize('provider'), async (req, res) => {
  try {
    // Get or create provider profile
    const provider = await getOrCreateProvider(req.user._id);

    const { title, description, category, price, duration, images } = req.body;

    // Validation
    if (!title || !description || !category || !price || !duration) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // Check if category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ success: false, message: 'Category not found' });
    }

    // Create service
    const service = await Service.create({
      provider: provider._id,
      title,
      description,
      category,
      price: Number(price),
      duration: Number(duration),
      images: images || [],
      primaryImage: images && images.length > 0 ? images[0] : '',
      isActive: true,
    });

    const populatedService = await Service.findById(service._id)
      .populate('provider', 'businessName rating totalReviews')
      .populate('category', 'name');

    res.status(201).json({ success: true, service: populatedService });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/services
// @desc    Get all services (PUBLIC)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice } = req.query;
    
    let query = { isActive: true };
    
    // Filter by category
    if (category) {
      query.category = category;
    }
    
    // Search in title and description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    const services = await Service.find(query)
      .populate('provider', 'businessName rating totalReviews')
      .populate('category', 'name')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/services/:id
// @desc    Get single service (PUBLIC)
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('provider', 'businessName description rating totalReviews address phone')
      .populate('category', 'name');
    
    if (!service || !service.isActive) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    
    res.json({ success: true, service });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/services/categories/list
// @desc    Get all categories (PUBLIC + Provider's custom categories)
// @access  Public (but can filter by provider)
router.get('/categories/list', async (req, res) => {
  try {
    const { providerId } = req.query;
    
    let query = { isActive: true };
    
    // If providerId is provided, include their custom categories
    if (providerId) {
      query.$or = [
        { provider: null }, // System categories
        { provider: providerId }, // Provider's custom categories
      ];
    } else {
      // Public: only system categories
      query.provider = null;
    }
    
    const categories = await Category.find(query).sort({ isCustom: 1, name: 1 });
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
