import api from './api';

export const authService = {
  // 1. SIGNUP (Now handles Auto-Login)
  signup: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    // Automatically save token if returned
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user_role', response.data.role);
    }
    return response.data;
  },

  // 2. LOGIN
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user_role', response.data.role);
    }
    return response.data;
  },

  // 3. Forgot Password Steps
  verifyIdentity: async (payload: any) => {
    const response = await api.post('/auth/verify-identity', payload);
    return response.data;
  },

  resetPassword: async (email: string, new_password: string) => {
    const response = await api.post('/auth/reset-password', { email, new_password });
    return response.data;
  }
};