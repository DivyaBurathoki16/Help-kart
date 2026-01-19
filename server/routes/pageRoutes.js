import express from 'express';
import mongoose from 'mongoose';
import PageContent from '../models/PageContent.js';

const router = express.Router();

// Default content definitions for public pages
const getDefaultPageContent = (slug) => {
  switch (slug) {
    case 'home':
      return {
        hero: {
          badgeText: 'Trusted by 50,000+ happy customers',
          headingLine1: 'Reliable Local Services',
          headingHighlight: 'at Your Doorstep',
          description:
            'From plumbing to electrical, cleaning to repairs — get verified professionals at your home with just a few clicks. Fast, affordable, and hassle-free.',
          primaryCta: { label: 'Book a Service', link: '/services' },
          secondaryCta: { label: 'How It Works', link: '/how-it-works' },
          backgroundImage: '/hero-bg.png',
        },
        expertSection: {
          title: 'Expert Services for Every Need',
          subtitle:
            'Browse our wide range of professional home services, delivered by verified experts in your area.',
        },
        popularSection: {
          title: 'Popular Services',
          subtitle:
            'Most booked services by our customers. Quick, reliable, and affordable.',
        },
        featuresSection: {
          heading: 'Why HelpKart?',
          subheading: 'Quality you can trust, speed you can rely on.',
          features: [
            {
              key: 'easy_discovery',
              title: 'Easy Discovery',
              description:
                'Find the perfect service provider with smart search and instant filters.',
            },
            {
              key: 'verified_experts',
              title: 'Verified Experts',
              description:
                'Every professional is background-checked and vetted for quality assurance.',
            },
            {
              key: 'seamless_booking',
              title: 'Seamless Booking',
              description:
                'Book, track, and pay for services in just a few taps — all in one place.',
            },
          ],
        },
        ctaSection: {
          heading: 'Ready to find the help you need?',
          description:
            'Join thousands of customers who have simplified their lives with HelpKart. Fast, reliable, and always at your service.',
          primaryCta: { label: 'Get Started Today', link: '/register' },
          secondaryCta: {
            label: 'Become a Professional →',
            link: '/become-provider',
          },
        },
      };

    case 'how-it-works':
      return {
        title: 'How HelpKart works',
        subtitle:
          'A simple, guided flow for customers and providers — designed to be fast, transparent, and reliable.',
        customerIntro: 'Book trusted services in a few steps.',
        providerIntro: 'Manage requests, jobs, and earnings with clarity.',
        customerSteps: [
          {
            key: 'browse_services',
            title: 'Browse services',
            description: 'Explore categories and choose the service you need.',
          },
          {
            key: 'book_in_minutes',
            title: 'Book in minutes',
            description: 'Pick a time and place your request with a few clicks.',
          },
          {
            key: 'track_status',
            title: 'Track status',
            description:
              'Stay updated as your booking progresses from request to completion.',
          },
          {
            key: 'pay_review',
            title: 'Pay & review',
            description:
              'Complete payment and leave feedback to help the community.',
          },
        ],
        providerSteps: [
          {
            key: 'setup_profile',
            title: 'Set up your profile',
            description: 'Create your provider profile and list your services.',
          },
          {
            key: 'receive_requests',
            title: 'Receive requests',
            description: 'Get booking requests from nearby customers.',
          },
          {
            key: 'complete_jobs',
            title: 'Accept & complete jobs',
            description: 'Manage your schedule and complete work professionally.',
          },
          {
            key: 'get_paid',
            title: 'Get paid',
            description:
              'Track bookings and monitor your earnings in one place.',
          },
        ],
        bottomCta: {
          heading: 'Ready to get started?',
          description:
            'Explore services, book an expert, and get it done — the HelpKart way.',
          primaryCta: { label: 'Browse services', link: '/services' },
          secondaryCta: {
            label: 'Become a provider',
            link: '/become-provider',
          },
        },
      };

    case 'why-us':
      return {
        title: 'Why HelpKart',
        subtitle:
          'Built to make home services simple, safe, and dependable — for customers and professionals alike.',
        stats: [
          { key: 'rating', label: 'Customer rating', value: '4.9/5', color: 'blue' },
          { key: 'jobs', label: 'Jobs completed', value: '75k+', color: 'indigo' },
          {
            key: 'providers',
            label: 'Verified providers',
            value: '2,500+',
            color: 'sky',
          },
          { key: 'cities', label: 'Cities covered', value: '120+', color: 'emerald' },
        ],
        reasons: [
          {
            key: 'verified_professionals',
            title: 'Verified professionals',
            description:
              'All providers are background-checked, identity-verified, and rated by real customers.',
            color: 'blue',
          },
          {
            key: 'transparent_pricing',
            title: 'Transparent pricing',
            description:
              "Clear, upfront pricing with no hidden fees. Know what you'll pay before you book.",
            color: 'emerald',
          },
          {
            key: 'fast_support',
            title: 'Fast, reliable support',
            description:
              'Our support team is available to help with bookings, reschedules, and any issues.',
            color: 'indigo',
          },
          {
            key: 'coverage',
            title: 'Coverage for every need',
            description:
              'From plumbing to cleaning, AC repair to handyman tasks — find experts for every job.',
            color: 'sky',
          },
        ],
        finalSection: {
          heading: 'A better way to book local services.',
          description:
            'With HelpKart, you get the ease of online booking, the trust of verified professionals, and the peace of mind that every job is tracked from request to completion.',
          primaryCta: { label: 'Browse services', link: '/services' },
          secondaryCta: {
            label: 'Learn how it works',
            link: '/how-it-works',
          },
        },
      };

    case 'reviews':
      return {
        title: 'Customer reviews',
        subtitle: 'Real feedback from customers who booked services through HelpKart.',
        ctaPrimary: { label: 'Book a service', link: '/services' },
        ctaSecondary: { label: 'Why HelpKart', link: '/why-us' },
        reviews: [
          {
            key: 'review_aarav',
            name: 'Aarav Sharma',
            service: 'Electrical',
            rating: 5,
            text:
              'Booked an electrician through HelpKart — quick response, clean work, and transparent pricing.',
            date: '2 weeks ago',
            avatar: 'AS',
          },
          {
            key: 'review_priya',
            name: 'Priya Verma',
            service: 'Cleaning',
            rating: 5,
            text:
              'Super easy booking. The cleaning team was punctual and the house looks amazing.',
            date: '1 month ago',
            avatar: 'PV',
          },
          {
            key: 'review_rahul',
            name: 'Rahul Mehta',
            service: 'Plumbing',
            rating: 4,
            text:
              'Great plumber. Fixed the leak fast and explained everything clearly. Would book again.',
            date: '3 weeks ago',
            avatar: 'RM',
          },
          {
            key: 'review_neha',
            name: 'Neha Gupta',
            service: 'AC Repair',
            rating: 5,
            text:
              'AC servicing was smooth from start to finish. Loved the status updates.',
            date: '1 week ago',
            avatar: 'NG',
          },
          {
            key: 'review_karan',
            name: 'Karan Singh',
            service: 'Mechanic',
            rating: 4,
            text:
              'Mechanic arrived on time and got my bike running perfectly. Professional and polite.',
            date: '2 months ago',
            avatar: 'KS',
          },
          {
            key: 'review_sana',
            name: 'Sana Khan',
            service: 'General',
            rating: 5,
            text:
              'The provider was verified and the experience felt trustworthy. Booking was effortless.',
            date: '3 weeks ago',
            avatar: 'SK',
          },
        ],
      };

    case 'static-services':
      return {
        services: [
          {
            _id: 'static-1',
            title: 'Plumbing Repair',
            description: 'Expert plumbing services for leaks, clogs, and installations',
            price: 75,
            category: 'Plumbing',
            images: [
              'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcAZo--21fAx2zHcbQbl1bfz0QqYKLCJCBcQ&s',
            ],
          },
          {
            _id: 'static-2',
            title: 'Electrical Wiring',
            description: 'Professional electrical work and safety inspections',
            price: 120,
            category: 'Electrical',
            images: [
              'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400',
            ],
          },
          {
            _id: 'static-3',
            title: 'Deep House Cleaning',
            description: 'Thorough cleaning service for your entire home',
            price: 150,
            category: 'Cleaning',
            images: [
              'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400',
            ],
          },
          {
            _id: 'static-4',
            title: 'AC Installation',
            description: 'Professional AC unit installation and setup',
            price: 300,
            category: 'AC Repair',
            images: [
              'https://tiimg.tistatic.com/fp/2/008/507/air-conditioning-installation-service-in-west-bengal-655.jpg',
            ],
          },
          {
            _id: 'static-5',
            title: 'Lawn Mowing',
            description: 'Regular lawn maintenance and grass cutting',
            price: 50,
            category: 'Lawn Care',
            images: [
              'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
            ],
          },
          {
            _id: 'static-6',
            title: 'Interior Painting',
            description: 'Professional interior painting services',
            price: 200,
            category: 'Painting',
            images: [
              'https://tiimg.tistatic.com/fp/1/009/149/interior-painting-services-253.jpg',
            ],
          },
          {
            _id: 'static-7',
            title: 'Custom Carpentry',
            description: 'Handcrafted furniture and custom woodwork',
            price: 250,
            category: 'Carpentry',
            images: [
              'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400',
            ],
          },
          {
            _id: 'static-8',
            title: 'Car Oil Change',
            description: 'Quick and professional automotive oil change service',
            price: 40,
            category: 'Automotive',
            images: [
              'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400',
            ],
          },
          {
            _id: 'static-9',
            title: 'Bathroom Renovation',
            description: 'Complete bathroom remodeling and renovation',
            price: 500,
            category: 'Plumbing',
            images: [
              'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTWTmiDpQe5MPGlfGRuDwzFjgDcnKgky4yknA&s',
            ],
          },
          {
            _id: 'static-10',
            title: 'Light Fixture Installation',
            description: 'Install and repair lighting fixtures',
            price: 80,
            category: 'Electrical',
            images: [
              'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400',
            ],
          },
          {
            _id: 'static-11',
            title: 'Window Cleaning',
            description: 'Crystal clear window cleaning service',
            price: 60,
            category: 'Cleaning',
            images: [
              'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400',
            ],
          },
          {
            _id: 'static-12',
            title: 'AC Maintenance',
            description: 'Regular AC maintenance and tune-up',
            price: 100,
            category: 'AC Repair',
            images: [
              'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
            ],
          },
          {
            _id: 'static-13',
            title: 'Garden Landscaping',
            description: 'Professional garden design and landscaping',
            price: 350,
            category: 'Lawn Care',
            images: [
              'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdqRsEfWL0F3ZVYswhAgnm27MEwrkiCJl59Q&s',
            ],
          },
          {
            _id: 'static-14',
            title: 'Exterior Painting',
            description: 'House exterior painting and weatherproofing',
            price: 400,
            category: 'Painting',
            images: [
              'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400',
            ],
          },
          {
            _id: 'static-15',
            title: 'Cabinet Installation',
            description: 'Custom kitchen and bathroom cabinet installation',
            price: 450,
            category: 'Carpentry',
            images: [
              'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5bJSSeeoiaGcCBQW4dw1_FqNbXc1GqTl0zg&s',
            ],
          },
          {
            _id: 'static-16',
            title: 'Tire Replacement',
            description: 'Professional tire replacement and balancing',
            price: 90,
            category: 'Automotive',
            images: [
              'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400',
            ],
          },
          {
            _id: 'static-17',
            title: 'Water Heater Repair',
            description: 'Fix and maintain your water heater system',
            price: 130,
            category: 'Plumbing',
            images: [
              'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400',
            ],
          },
          {
            _id: 'static-18',
            title: 'Smart Home Setup',
            description: 'Install and configure smart home devices',
            price: 180,
            category: 'Electrical',
            images: [
              'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXIUm0I1u6bYd4-nROjgQligZG8QPpk467tA&s',
            ],
          },
          {
            _id: 'static-19',
            title: 'Carpet Cleaning',
            description: 'Deep steam cleaning for carpets and rugs',
            price: 110,
            category: 'Cleaning',
            images: [
              'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcUD32Nh4pIHxyGG_DfQHGNTUYq72hdQMq7g&s',
            ],
          },
          {
            _id: 'static-20',
            title: 'AC Duct Cleaning',
            description: 'Thorough air duct cleaning and sanitization',
            price: 200,
            category: 'AC Repair',
            images: [
              'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTitAT5YgqmEpI6cDu7vmjSybcjHeSB9upoTw&s',
            ],
          },
        ],
      };

    default:
      return {};
  }
};

// @route   GET /api/pages/:slug
// @desc    Get dynamic page content (PUBLIC) with sensible defaults
// @access  Public
router.get('/:slug', async (req, res) => {
  try {
    const slug = req.params.slug.toLowerCase();
    
    // Try to get from database if MongoDB is connected
    if (mongoose.connection.readyState === 1) {
      try {
        const page = await PageContent.findOne({ slug });
        if (page && page.data) {
          return res.json({
            success: true,
            data: page.data,
            isDefault: false,
            updatedAt: page.updatedAt,
          });
        }
      } catch (dbError) {
        console.warn('Database query failed, using defaults:', dbError.message);
      }
    }
    
    // Fallback to default content
    const defaultData = getDefaultPageContent(slug);
    res.json({
      success: true,
      data: defaultData,
      isDefault: true,
    });
  } catch (error) {
    console.error('Error fetching page content:', error);
    // Fallback to default content on error to keep frontend functional
    const defaultData = getDefaultPageContent(req.params.slug?.toLowerCase() || 'home');
    res.json({
      success: true,
      data: defaultData,
      isDefault: true,
    });
  }
});

export default router;

