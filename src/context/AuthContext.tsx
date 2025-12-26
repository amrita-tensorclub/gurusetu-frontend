"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api'; 
import { User, LoginCredentials, SignupData, AuthResponse } from '@/types/user';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean; // Corrected from 'bool'
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
    setLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const { data } = await api.post<AuthResponse>('/auth/login', credentials);
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      toast.success('Welcome back!');
      router.push(data.user.role === 'student' ? '/dashboard/student' : '/dashboard/faculty');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Login failed');
    }
  };

  const signup = async (data: SignupData) => {
    try {
      await api.post('/auth/signup', data);
      toast.success('Account created! Please login.');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Signup failed');
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};