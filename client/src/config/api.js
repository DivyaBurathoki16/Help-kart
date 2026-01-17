// API Configuration
// This file centralizes all API endpoint configuration
// The API URL is loaded from environment variables

const API_URL = import.meta.env.VITE_API_URL;

// Helper function to build full API URL
export const getApiUrl = (endpoint) => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  // Ensure API_URL doesn't have trailing slash
  const cleanBaseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  return `${cleanBaseUrl}/${cleanEndpoint}`;
};

// Export the base API URL for direct use if needed
export default API_URL;
