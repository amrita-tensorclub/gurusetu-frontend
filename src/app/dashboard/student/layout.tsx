'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { NavItem } from '@/types';

const studentNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard/student' },
  { label: 'My Profile', href: '/dashboard/student/profile' },
  { label: 'All Faculty', href: '/dashboard/student/faculty' },
  { label: 'Collaboration Hub', href: '/dashboard/student/collaboration' },
  { label: 'Recommendations', href: '/dashboard/student/recommendations', badge: 3 },
];

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar 
        navItems={studentNavItems}
        userName={userName}
        userRole="student"
        onLogout={handleLogout}
      />
      <main className="py-8">
        {children}
      </main>
    </div>
  );
}