'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface FacultyProfile {
  id: string;
  name: string;
  employee_id: string;
  designation: string | null;
  department: {
    name: string;
    code: string;
  };
  user: {
    email: string;
    username: string;
  };
}

interface NavigationMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FacultyNavigationMenu({ isOpen, onClose }: NavigationMenuProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<FacultyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFacultyProfile();
  }, []);

  const loadFacultyProfile = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!userData.id || !supabase) {
        // Fallback to localStorage if no user ID or no database
        const profileData = localStorage.getItem('profile');
        if (profileData) {
          setProfile(JSON.parse(profileData));
        }
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('faculty')
        .select(`
          *,
          department:departments(name, code),
          user:users(email, username)
        `)
        .eq('user_id', userData.id)
        .single();

      if (data && !error) {
        setProfile(data);
        // Update localStorage with fresh data
        localStorage.setItem('profile', JSON.stringify(data));
      } else {
        // Fallback to localStorage if database query fails
        const profileData = localStorage.getItem('profile');
        if (profileData) {
          setProfile(JSON.parse(profileData));
        } else {
          // Default fallback data
          const defaultProfile = {
            id: '1',
            name: 'Rajesh Kumar',
            employee_id: 'FAC.CSE.2015',
            designation: 'Assistant Professor',
            department: { name: 'Computer Science & Engineering', code: 'CSE' },
            user: { email: 'rajesh.kumar@amrita.edu', username: 'rajeshk' }
          };
          setProfile(defaultProfile);
        }
      }
    } catch (error) {
      console.error('Error loading faculty profile:', error);
      // Use fallback data
      const profileData = localStorage.getItem('profile');
      if (profileData) {
        setProfile(JSON.parse(profileData));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('profile');
    localStorage.removeItem('userRole');
    router.push('/login');
  };

  const menuItems = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      label: 'Home',
      href: '/dashboard/faculty'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      label: 'Profile',
      href: '/dashboard/faculty/profile'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      label: 'My Projects',
      href: '/dashboard/faculty/projects'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
      label: 'Faculty Collaborations',
      href: '/dashboard/faculty/collaborations'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      label: 'Help & Support',
      href: '/dashboard/faculty/help'
    }
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-80 bg-white z-50 shadow-lg">
        {/* Header */}
        <div className="bg-[#8B1538] text-white px-6 py-8">
          {isLoading ? (
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-white/20 animate-pulse"></div>
              <div className="flex-1">
                <div className="h-5 bg-white/20 rounded animate-pulse mb-2"></div>
                <div className="h-4 bg-white/20 rounded animate-pulse mb-1"></div>
                <div className="h-4 bg-white/20 rounded animate-pulse w-20"></div>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              {/* Profile Photo */}
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Profile Info */}
              <div className="flex-1">
                <h2 className="text-lg font-semibold">
                  Dr. {profile?.name || 'Faculty Member'}
                </h2>
                <p className="text-sm text-white/80">
                  Employee ID: {profile?.employee_id || 'Loading...'}
                </p>
                <p className="text-sm text-white/80">
                  Department: {profile?.department?.code || 'N/A'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <div className="py-4">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              onClick={onClose}
              className="flex items-center justify-between px-6 py-4 text-gray-700 hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-center space-x-4">
                <div className="text-[#8B1538] group-hover:text-[#7A1230]">
                  {item.icon}
                </div>
                <span className="text-lg font-medium">{item.label}</span>
              </div>
              <svg 
                className="w-5 h-5 text-gray-400 group-hover:text-gray-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
          
          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center justify-between w-full px-6 py-4 text-gray-700 hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-center space-x-4">
              <div className="text-[#8B1538] group-hover:text-[#7A1230]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <span className="text-lg font-medium">Logout</span>
            </div>
            <svg 
              className="w-5 h-5 text-gray-400 group-hover:text-gray-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Version */}
        <div className="absolute bottom-4 left-6 text-sm text-gray-400">
          Version 2.1.4
        </div>
      </div>
    </>
  );
}