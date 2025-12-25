import api from './api';

export const authService = {
  // 1. SIGNUP: Matches your @router.post("/register")
  signup: async (userData: any) => {
    // URL: /auth/register
    const response = await api.post('/auth/register', userData); 
    return response.data;
  },

  // 2. LOGIN: Matches your @router.post("/login")
  login: async (email: string, password: string) => {
    // URL: /auth/login
    // Payload matches UserLogin class: { email, password }
    const response = await api.post('/auth/login', { 
      email: email, 
      password: password 
    });
    
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    return response.data;
  }
};