import mongoose from 'mongoose';

const categorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a category name'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    icon: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isCustom: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null = system category, ObjectId = provider-created
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      default: null, // For provider-specific categories
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: name + provider for uniqueness per provider
categorySchema.index({ name: 1, provider: 1 }, { unique: true, sparse: true });
// For system categories (provider is null), name must be unique
categorySchema.index({ name: 1 }, { unique: true, partialFilterExpression: { provider: null } });

const Category = mongoose.model('Category', categorySchema);

export default Category;
