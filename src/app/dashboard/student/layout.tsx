'use client';

import { useEffect, useState } from 'react';

export default function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Get user info from localStorage
    const profileData = localStorage.getItem('profile');
    if (profileData) {
      const profile = JSON.parse(profileData);
      setUserName(profile.name || 'Student');
    }
  }, []);

  const handleLogout = () => {
    // Clear localStorage and redirect
    localStorage.removeItem('user');
    localStorage.removeItem('profile');
    localStorage.removeItem('userRole');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}