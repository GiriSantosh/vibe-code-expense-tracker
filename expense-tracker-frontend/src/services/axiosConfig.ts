import axios from 'axios';

// Token storage utilities (same as in AuthContext)
const TOKEN_STORAGE_KEY = 'expense_tracker_token';
const USER_STORAGE_KEY = 'expense_tracker_user';

const tokenStorage = {
  getToken: () => sessionStorage.getItem(TOKEN_STORAGE_KEY),
  setToken: (token: string) => sessionStorage.setItem(TOKEN_STORAGE_KEY, token),
  removeToken: () => sessionStorage.removeItem(TOKEN_STORAGE_KEY),
  clearAll: () => {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(USER_STORAGE_KEY);
  }
};

// Create axios instance with base configuration
export const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080',
  timeout: 10000,
});

// Request interceptor to add Bearer token to all requests
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getToken();
    
    // Add Authorization header if token exists and it's an API request
    if (token && config.url?.startsWith('/api/')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request details for debugging
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      hasToken: !!token,
      headers: config.headers.Authorization ? 'Bearer ***' : 'None'
    });
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    const { response } = error;
    
    // Log error responses
    console.error(`API Error: ${response?.status} ${error.config?.url}`, {
      status: response?.status,
      message: response?.data?.message || error.message
    });
    
    // Handle 401 Unauthorized - token expired or invalid
    if (response?.status === 401 && error.config?.url?.startsWith('/api/')) {
      console.log('Token expired or invalid - clearing storage');
      
      // Clear stored token and user data
      tokenStorage.clearAll();
      
      // Don't redirect here - let the component handle it
      // The AuthContext will detect the cleared token and handle logout
      
      // Dispatch a custom event that AuthContext can listen to
      window.dispatchEvent(new CustomEvent('token-expired'));
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;