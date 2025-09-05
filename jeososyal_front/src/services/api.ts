import axios from 'axios';

// TODO: Update this base URL to match your backend server
/*
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8000/api' 
  : 'https://your-backend-domain.com/api';*/

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens
api.interceptors.request.use(
  (config) => {
    // TODO: Add authentication token if needed
    // const token = localStorage.getItem('authToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    // TODO: Handle specific error cases (401, 403, 500, etc.)
    return Promise.reject(error);
  }
);

export default api;