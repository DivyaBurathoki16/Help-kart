// API Configuration
// This file centralizes all API endpoint configuration
// The API URL is loaded from environment variables

<<<<<<< HEAD
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
=======
// Get API URL from environment or use default
const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  
  // If environment variable is set and valid
  if (envUrl && envUrl.trim() && !envUrl.includes('undefined')) {
    return envUrl.trim();
  }
  
  // Default fallback
  return 'http://localhost:5000';
};

const API_URL = getBaseUrl();
>>>>>>> ee5694c89638ac804a1e46c27de9bc857dfb54d0

// Helper function to build full API URL
export const getApiUrl = (endpoint) => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
<<<<<<< HEAD
  // Ensure API_URL doesn't have trailing slash
  const cleanBaseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  return `${cleanBaseUrl}/${cleanEndpoint}`;
=======
  
  // Get base URL
  const baseUrl = getBaseUrl();
  
  // Ensure base URL doesn't have trailing slash
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  
  const fullUrl = `${cleanBaseUrl}/${cleanEndpoint}`;
  
  // Debug logging in development
  if (import.meta.env.DEV) {
    console.log(`[API] Requesting: ${fullUrl}`);
  }
  
  return fullUrl;
>>>>>>> ee5694c89638ac804a1e46c27de9bc857dfb54d0
};

// Export the base API URL for direct use if needed
export default API_URL;
