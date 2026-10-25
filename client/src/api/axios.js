import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auto-attach JWT token from localStorage if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('civictrack_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercept response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401 Unauthorized and not on login, clear token
    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        // localStorage.removeItem('civictrack_token');
        // localStorage.removeItem('civictrack_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
