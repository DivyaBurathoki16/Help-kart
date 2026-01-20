import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

// Load environment variables
dotenv.config();

<<<<<<< HEAD
// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET', 'MONGODB_URI'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingEnvVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\nPlease create a .env file in the server directory with these variables.');
  process.exit(1);
}

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
=======
const app = express();

// Middleware
app.use(cors());
>>>>>>> ee5694c89638ac804a1e46c27de9bc857dfb54d0
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// MongoDB Connection
<<<<<<< HEAD
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully');
  })
  .catch((error) => {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  });

// Basic Route
app.get('/', (req, res) => {
  res.json({ message: 'Local Service Provider API is running!' });
=======
if (process.env.MONGODB_URI) {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('✅ MongoDB Connected Successfully');
    })
    .catch((error) => {
      console.error('❌ MongoDB Connection Error:', error.message);
      console.warn('⚠️  Server will continue without database. Some features may not work.');
      console.warn('💡 To fix: Set MONGODB_URI in your .env file');
    });
} else {
  console.warn('⚠️  MONGODB_URI not set. Server will run without database.');
  console.warn('💡 Page content will use default values and won\'t be persisted.');
}

// Basic Route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Local Service Provider API is running!',
    status: 'ok',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
>>>>>>> ee5694c89638ac804a1e46c27de9bc857dfb54d0
});

// Serve static files from uploads directory
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// API Routes
import authRoutes from './routes/authRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import providerRoutes from './routes/providerRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import behaviorReportRoutes from './routes/behaviorReportRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
<<<<<<< HEAD
import reviewRoutes from './routes/reviewRoutes.js';
=======
import pageRoutes from './routes/pageRoutes.js';
>>>>>>> ee5694c89638ac804a1e46c27de9bc857dfb54d0
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/provider', providerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/behavior-reports', behaviorReportRoutes);
app.use('/api', contactRoutes);
<<<<<<< HEAD
app.use('/api/reviews', reviewRoutes);
=======
app.use('/api/pages', pageRoutes);
>>>>>>> ee5694c89638ac804a1e46c27de9bc857dfb54d0
// app.use('/api/users', userRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
