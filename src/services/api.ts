// frontend/src/services/api.ts
import axios from 'axios';

const api = axios.create({
  // ✅ Change this line to use the environment variable
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// ... rest of your code

// Interceptor to add Authorization header
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    // 1. Try to get the "user" object where you stored the token
    const userStr = localStorage.getItem('user');
    
    // 2. Also check for a standalone "token" key (cleanup/fallback)
    const standaloneToken = localStorage.getItem('token');

    let token = null;

    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        token = user.access_token; 
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }

    // Fallback if 'user' object failed but 'token' exists
    if (!token && standaloneToken) {
      token = standaloneToken;
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle Errors Globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('Session expired or unauthorized');
      // Optional: Redirect to login
      // window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default api;