import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Provider from './models/Provider.js';
import Category from './models/Category.js';
import Service from './models/Service.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
  process.exit(1);
}

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data (optional - remove if you want to keep existing data)
    // await Service.deleteMany({});
    // await Category.deleteMany({});
    // await Provider.deleteMany({});
    // await User.deleteMany({ role: 'provider' });

    // Create Categories
    const categories = [
      { name: 'Home Cleaning', description: 'Professional home cleaning services' },
      { name: 'Plumbing', description: 'Expert plumbing and repair services' },
      { name: 'Electrical', description: 'Electrical installation and repair' },
      { name: 'Gardening', description: 'Lawn care and gardening services' },
      { name: 'Painting', description: 'Interior and exterior painting' },
      { name: 'Carpentry', description: 'Custom carpentry and woodworking' },
    ];

    const createdCategories = [];
    for (const cat of categories) {
      let category = await Category.findOne({ name: cat.name });
      if (!category) {
        category = await Category.create(cat);
        console.log(`✅ Created category: ${cat.name}`);
      } else {
        console.log(`ℹ️  Category already exists: ${cat.name}`);
      }
      createdCategories.push(category);
    }

    // Create Provider User
    let providerUser = await User.findOne({ email: 'provider@test.com' });
    if (!providerUser) {
      providerUser = await User.create({
        name: 'Test Provider',
        email: 'provider@test.com',
        password: 'password123',
        role: 'provider',
        phone: '+1234567890',
      });
      console.log('✅ Created provider user');
    } else {
      console.log('ℹ️  Provider user already exists');
    }

    // Create Provider Profile
    let providerProfile = await Provider.findOne({ user: providerUser._id });
    if (!providerProfile) {
      providerProfile = await Provider.create({
        user: providerUser._id,
        businessName: 'Elite Home Services',
        description: 'Professional home service provider with years of experience',
        phone: '+1234567890',
        isApproved: true,
        rating: 4.5,
        totalReviews: 25,
      });
      console.log('✅ Created provider profile');
    } else {
      console.log('ℹ️  Provider profile already exists');
    }

    // Create Services
    const services = [
      {
        title: 'Deep House Cleaning',
        description: 'Comprehensive deep cleaning service for your entire home. Includes kitchen, bathrooms, bedrooms, and living areas. Perfect for spring cleaning or before special events.',
        category: createdCategories[0]._id,
        price: 150,
        duration: 240,
        rating: 4.8,
        images: ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800'],
      },
      {
        title: 'Emergency Plumbing Repair',
        description: '24/7 emergency plumbing services. Fast response for leaks, clogs, and urgent repairs. Licensed and insured professionals.',
        category: createdCategories[1]._id,
        price: 120,
        duration: 60,
        rating: 4.9,
        images: ['https://images.unsplash.com/photo-1628075569959-9ef5e2b6d2b8?w=800'],
      },
      {
        title: 'Electrical Installation',
        description: 'Professional electrical installation and repair services. Safety-certified electricians for all your electrical needs.',
        category: createdCategories[2]._id,
        price: 200,
        duration: 120,
        rating: 4.7,
        images: ['https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800'],
      },
      {
        title: 'Lawn Care & Gardening',
        description: 'Complete lawn care and gardening services. Mowing, trimming, planting, and seasonal maintenance.',
        category: createdCategories[3]._id,
        price: 80,
        duration: 90,
        rating: 4.6,
        images: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800'],
      },
      {
        title: 'Interior Painting',
        description: 'Professional interior painting services. Quality paints and expert application for a perfect finish.',
        category: createdCategories[4]._id,
        price: 300,
        duration: 180,
        rating: 4.8,
        images: ['https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800'],
      },
      {
        title: 'Custom Furniture Repair',
        description: 'Expert carpentry services for custom furniture repair and restoration. Bring your old furniture back to life.',
        category: createdCategories[5]._id,
        price: 175,
        duration: 150,
        rating: 4.7,
        images: ['https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800'],
      },
    ];

    let servicesCreated = 0;
    for (const service of services) {
      const existingService = await Service.findOne({ 
        title: service.title,
        provider: providerProfile._id 
      });
      
      if (!existingService) {
        await Service.create({
          ...service,
          provider: providerProfile._id,
          isActive: true,
        });
        servicesCreated++;
        console.log(`✅ Created service: ${service.title}`);
      } else {
        console.log(`ℹ️  Service already exists: ${service.title}`);
      }
    }

    console.log('\n🎉 Seeding completed!');
    console.log(`✅ Created ${servicesCreated} new services`);
    console.log(`📊 Total categories: ${createdCategories.length}`);
    console.log('\n💡 You can now view services at: http://localhost:5173/services');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
