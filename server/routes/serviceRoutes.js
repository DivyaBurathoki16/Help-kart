import express from 'express';
import Service from '../models/Service.js';
import Provider from '../models/Provider.js';
import Category from '../models/Category.js';
import User from '../models/User.js';
import { protect, authorize, optionalProtect } from '../middleware/auth.js';
import { getDistanceFromCustomer } from '../utils/distanceUtils.js';

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

    const { title, description, category, price, duration, images, location } = req.body;

    // Validation
    if (!title || !description || !category || !price || !duration) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // Handle category - can be ID or name string for new categories
    let categoryId = category;
    
    // Check if category is a valid ObjectId (existing category)
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(category);
    
    if (isValidObjectId) {
      // Category is an ID - verify it exists
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({ success: false, message: 'Category not found' });
      }
      categoryId = category;
    } else {
      // Category is a name string - create or find global category
      const categoryName = category.trim();
      if (!categoryName) {
        return res.status(400).json({ success: false, message: 'Category name is required' });
      }
      
      // Check if global category exists (provider: null)
      let existingCategory = await Category.findOne({
        name: categoryName,
        provider: null,
      });
      
      if (!existingCategory) {
        // Create new global category
        existingCategory = await Category.create({
          name: categoryName,
          description: '',
          isCustom: true,
          isActive: true,
          provider: null, // Global category visible to all
          createdBy: req.user._id,
        });
      }
      
      categoryId = existingCategory._id;
    }

    // Create service
    const serviceData = {
      provider: provider._id,
      title,
      description,
      category: categoryId,
      price: Number(price),
      duration: Number(duration),
      images: images || [],
      primaryImage: images && images.length > 0 ? images[0] : '',
      isActive: true,
    };

    // Add location if provided
    if (location) {
      serviceData.location = location;
    }

    const service = await Service.create(serviceData);

    const populatedService = await Service.findById(service._id)
      .populate('provider', 'businessName rating totalReviews')
      .populate('category', 'name');

    res.status(201).json({ success: true, service: populatedService });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/services
// @desc    Get all services (PUBLIC) - Supports location-based filtering and sorting
// @access  Public (optional auth for customer location)
router.get('/', optionalProtect, async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, maxDistance, sortBy } = req.query;
    
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
      .populate('category', 'name');
    
    // Get customer location if user is logged in
    let customerLocation = null;
    if (req.user) {
      const user = await User.findById(req.user._id).select('location');
      if (user && user.location && user.location.latitude && user.location.longitude) {
        customerLocation = user.location;
      }
    }
    
    // Calculate distances and add to services if customer location is available
    let servicesWithDistance = services.map(service => {
      const serviceObj = service.toObject();
      if (customerLocation && service.location && service.location.latitude && service.location.longitude) {
        const distance = getDistanceFromCustomer(customerLocation, service.location);
        serviceObj.distance = distance;
      }
      return serviceObj;
    });
    
    // Filter by max distance if specified
    if (maxDistance && customerLocation) {
      const maxDist = Number(maxDistance);
      servicesWithDistance = servicesWithDistance.filter(service => {
        return service.distance !== null && service.distance <= maxDist;
      });
    }
    
    // Sort services
    if (sortBy === 'distance' && customerLocation) {
      // Sort by distance (nearest first)
      servicesWithDistance.sort((a, b) => {
        if (a.distance === null && b.distance === null) return 0;
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
    } else if (sortBy === 'price') {
      // Sort by price (lowest first)
      servicesWithDistance.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'rating') {
      // Sort by rating (highest first)
      servicesWithDistance.sort((a, b) => {
        const ratingA = a.rating || a.provider?.rating || 0;
        const ratingB = b.rating || b.provider?.rating || 0;
        return ratingB - ratingA;
      });
    } else {
      // Default: sort by creation date (newest first)
      servicesWithDistance.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    res.json({ success: true, services: servicesWithDistance });
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
    
    // Always return all global categories (system + custom global)
    // Custom categories are now global (provider: null), so show all where provider is null
    query.provider = null;
    
    const categories = await Category.find(query).sort({ isCustom: 1, name: 1 });
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
