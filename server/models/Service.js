import mongoose from 'mongoose';

const serviceSchema = mongoose.Schema(
  {
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please add a service title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a service description'],
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
      min: 0,
    },
    duration: {
      type: Number, // in minutes
      required: true,
    },
    images: [
      {
        type: String, // URL or path to image
      },
    ],
    primaryImage: {
      type: String, // Primary image URL/path (first image by default)
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isRemoved: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalBookings: {
      type: Number,
      default: 0,
    },
    location: {
      latitude: {
        type: Number,
      },
      longitude: {
        type: Number,
      },
      address: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        trim: true,
      },
      state: {
        type: String,
        trim: true,
      },
      zipCode: {
        type: String,
        trim: true,
      },
      country: {
        type: String,
        trim: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

const Service = mongoose.model('Service', serviceSchema);

export default Service;
