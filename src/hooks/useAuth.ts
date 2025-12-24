'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'faculty' | 'admin';
  [key: string]: any;
}

export function useAuth(requiredRole?: 'student' | 'faculty') {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, [pathname]); // Re-check on route change

  const checkAuth = async () => {
    setLoading(true);
    try {
      // 1. Check Local Storage (Fastest check)
      const storedUser = localStorage.getItem('user');
      
      if (!storedUser) {
        handleUnauthenticated();
        return;
      }

      const parsedUser = JSON.parse(storedUser);
      
      // 2. Role Verification
      if (requiredRole && parsedUser.role !== requiredRole) {
        // User logged in but wrong role (e.g. student trying to access faculty page)
        router.push(`/dashboard/${parsedUser.role}`); // Redirect to their correct dashboard
        return;
      }

      // 3. Success
      setUser(parsedUser);
    } catch (error) {
      handleUnauthenticated();
    } finally {
      setLoading(false);
    }
  };

  const handleUnauthenticated = () => {
    // Only redirect if we are inside a dashboard route
    if (pathname?.includes('/dashboard')) {
      router.push('/login');
    }
    setUser(null);
  };

  const logout = () => {
    localStorage.removeItem('user');
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"; // Clear cookie if using them
    router.push('/login');
  };

  return { user, loading, logout };
}