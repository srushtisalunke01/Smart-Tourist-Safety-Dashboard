import axios from 'axios';

// Create central Axios instance
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to automatically attach authorization token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle global errors (like token expiration)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If unauthorized, token might be expired
    if (error.response && error.response.status === 401) {
      console.warn('Unauthorized access detected. Token might be expired.');
    }
    return Promise.reject(error);
  }
);

export default api;
