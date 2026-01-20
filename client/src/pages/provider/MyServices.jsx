import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
<<<<<<< HEAD
import DeleteConfirmModal from '../../components/modals/DeleteConfirmModal';
=======
>>>>>>> ee5694c89638ac804a1e46c27de9bc857dfb54d0
import { getApiUrl } from '../../config/api';
import API_URL from '../../config/api';

const MyServices = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
<<<<<<< HEAD
  const [deleteServiceModal, setDeleteServiceModal] = useState(null);
  const [deletingService, setDeletingService] = useState(false);
=======
>>>>>>> ee5694c89638ac804a1e46c27de9bc857dfb54d0

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await axios.get(getApiUrl('api/provider/services'));
      setServices(response.data.services || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  const handleDeleteClick = (service) => {
    setDeleteServiceModal(service);
  };

  const handleConfirmDelete = async () => {
    if (!deleteServiceModal) return;

    try {
      setDeletingService(true);
      await axios.delete(getApiUrl(`api/provider/services/${deleteServiceModal._id}`));
      setDeleteServiceModal(null);
      fetchServices(); // Refresh the list
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete service');
    } finally {
      setDeletingService(false);
=======
  const handleDelete = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(getApiUrl(`api/provider/services/${serviceId}`));
      fetchServices(); // Refresh the list
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete service');
>>>>>>> ee5694c89638ac804a1e46c27de9bc857dfb54d0
    }
  };

  const toggleServiceStatus = async (serviceId, currentStatus) => {
    try {
      await axios.patch(getApiUrl(`api/provider/services/${serviceId}`), {
        isActive: !currentStatus,
      });
      fetchServices(); // Refresh the list
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update service status');
    }
  };

  // Helper function to format image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/')) return `${API_URL}${imagePath}`;
    return imagePath;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <button
              onClick={() => navigate('/provider/dashboard')}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-4 block font-medium flex items-center gap-2 group transition-all duration-300"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-neutral-100">My Services</h1>
            <p className="mt-2 text-gray-600 dark:text-neutral-300">Manage your service offerings</p>
          </div>
          <Link
            to="/provider/services/add"
            className="bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            + Add Service
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-neutral-300">Loading services...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="bg-white dark:bg-neutral-800 dark:border-neutral-700 rounded-lg shadow-md p-12 text-center border border-gray-200">
            <p className="text-gray-600 dark:text-neutral-300 text-lg mb-6">You haven't created any services yet.</p>
            <Link
              to="/provider/services/add"
              className="inline-block bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Create Your First Service
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service._id}
                className="bg-white dark:bg-neutral-800 dark:border-neutral-700 rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden border border-gray-200"
              >
                {service.images && service.images.length > 0 ? (
                  <img
                    src={getImageUrl(service.images[0])}
                    alt={service.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '';
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 dark:bg-neutral-700 flex items-center justify-center">
                    <span className="text-gray-400 dark:text-neutral-500">No Image</span>
                  </div>
                )}
                
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-neutral-100 line-clamp-1">
                      {service.title}
                    </h3>
                    {service.category && (
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs font-medium">
                        {service.category.name}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 dark:text-neutral-300 text-sm mb-4 line-clamp-2">
                    {service.description}
                  </p>

                  <div className="flex justify-between items-center mb-4">
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">₹{service.price}</span>
                    <span className="text-sm text-gray-500 dark:text-neutral-400">{service.duration} min</span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        service.isActive
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                          : 'bg-gray-100 dark:bg-neutral-700 text-gray-800 dark:text-neutral-300'
                      }`}
                    >
                      {service.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <Link
                      to={`/services/${service._id}`}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                    >
                      View →
                    </Link>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-neutral-700">
                    <button
                      onClick={() => toggleServiceStatus(service._id, service.isActive)}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        service.isActive
                          ? 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/40'
                          : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40'
                      }`}
                    >
                      {service.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <Link
                      to={`/provider/services/edit/${service._id}`}
                      className="flex-1 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors text-center"
                    >
                      Edit
                    </Link>
                    <button
<<<<<<< HEAD
                      onClick={() => handleDeleteClick(service)}
=======
                      onClick={() => handleDelete(service._id)}
>>>>>>> ee5694c89638ac804a1e46c27de9bc857dfb54d0
                      className="flex-1 px-3 py-2 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
<<<<<<< HEAD

      {/* Delete Service Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteServiceModal}
        onClose={() => setDeleteServiceModal(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Service?"
        message="Are you sure you want to delete this service? This action cannot be undone."
        itemName={deleteServiceModal?.title}
        isLoading={deletingService}
      />
=======
>>>>>>> ee5694c89638ac804a1e46c27de9bc857dfb54d0
    </div>
  );
};

export default MyServices;
