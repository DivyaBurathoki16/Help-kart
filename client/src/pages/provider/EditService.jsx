import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import ImageUpload from '../../components/ImageUpload';

const EditService = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    duration: '',
    images: [],
    isActive: true,
  });

  useEffect(() => {
    fetchCategories();
    fetchService();
  }, [id]);

  const fetchCategories = async () => {
    try {
      // Get provider ID to fetch their custom categories
      const providerResponse = await axios.get('http://localhost:5000/api/provider/profile').catch(() => null);
      const providerId = providerResponse?.data?.provider?._id;
      
      const url = providerId 
        ? `http://localhost:5000/api/services/categories/list?providerId=${providerId}`
        : 'http://localhost:5000/api/services/categories/list';
      
      const response = await axios.get(url);
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      alert('Please enter a category name');
      return;
    }

    setCreatingCategory(true);
    try {
      const response = await axios.post('http://localhost:5000/api/provider/categories', {
        name: newCategoryName.trim(),
      });
      
      // Add new category to list and select it
      const newCategory = response.data.category;
      setCategories([...categories, newCategory]);
      setFormData({ ...formData, category: newCategory._id });
      setShowNewCategory(false);
      setNewCategoryName('');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create category';
      if (errorMessage.includes('Provider profile not found')) {
        const shouldGoToProfile = window.confirm(
          'You need to create your provider profile first before creating categories or services. Would you like to go to your profile page now?'
        );
        if (shouldGoToProfile) {
          navigate('/provider/profile');
        }
      } else {
        alert(errorMessage);
      }
    } finally {
      setCreatingCategory(false);
    }
  };

  const fetchService = async () => {
    try {
      setFetching(true);
      const response = await axios.get(`http://localhost:5000/api/services/${id}`);
      const service = response.data.service;
      
      setFormData({
        title: service.title || '',
        description: service.description || '',
        category: service.category?._id || '',
        price: service.price || '',
        duration: service.duration || '',
        images: service.images || [],
        isActive: service.isActive !== undefined ? service.isActive : true,
      });
    } catch (error) {
      console.error('Error fetching service:', error);
      alert('Failed to load service details');
      navigate('/provider/services');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const serviceData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        price: Number(formData.price),
        duration: Number(formData.duration),
        images: formData.images || [],
        primaryImage: formData.images && formData.images.length > 0 ? formData.images[0] : '',
        isActive: formData.isActive,
      };

      await axios.patch(`http://localhost:5000/api/provider/services/${id}`, serviceData);
      navigate('/provider/services');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update service';
      if (errorMessage.includes('Provider profile not found')) {
        const shouldGoToProfile = window.confirm(
          'You need to create your provider profile first. Would you like to go to your profile page now?'
        );
        if (shouldGoToProfile) {
          navigate('/provider/profile');
        }
      } else {
        alert(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading service details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/provider/services')}
            className="text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Back to My Services
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Service</h1>
          <p className="mt-2 text-gray-600">Update your service details</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Service Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Professional House Cleaning"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe your service in detail..."
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <div className="space-y-2">
                <select
                  id="category"
                  name="category"
                  required={!showNewCategory}
                  value={showNewCategory ? '' : formData.category}
                  onChange={(e) => {
                    if (e.target.value === 'new') {
                      setShowNewCategory(true);
                      setFormData({ ...formData, category: '' });
                    } else {
                      setShowNewCategory(false);
                      handleChange(e);
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name} {cat.isCustom ? '(Custom)' : ''}
                    </option>
                  ))}
                  <option value="new">+ Add New Category</option>
                </select>
                
                {showNewCategory && (
                  <div className="flex gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Enter new category name"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleCreateCategory();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleCreateCategory}
                      disabled={creatingCategory}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {creatingCategory ? 'Creating...' : 'Create'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewCategory(false);
                        setNewCategoryName('');
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Price and Duration */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Price ($) *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes) *
                </label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  required
                  min="1"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="60"
                />
              </div>
            </div>

            {/* Images */}
            <ImageUpload
              images={formData.images}
              onChange={(images) => setFormData({ ...formData, images })}
              maxImages={10}
            />

            {/* Active Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                Service is active (visible to customers)
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/provider/services')}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating...' : 'Update Service'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditService;
