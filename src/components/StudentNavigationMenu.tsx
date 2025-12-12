'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface StudentData {
  id: string;
  name: string;
  roll_number: string;
  year: number;
  department_id: string;
  bio: string | null;
  phone_number: string | null;
  department: {
    id: string;
    name: string;
    code: string;
  };
  user: {
    email: string;
    username: string;
  };
}

interface StudentNavigationMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StudentNavigationMenu({ isOpen, onClose }: StudentNavigationMenuProps) {
  const router = useRouter();
  const [studentProfile, setStudentProfile] = useState<StudentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadStudentProfile();
    }
  }, [isOpen]);

  const loadStudentProfile = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (userData.id) {
        const { data, error } = await supabase
          .from('students')
          .select(`
            *,
            department:departments(id, name, code),
            user:users(email, username)
          `)
          .eq('user_id', userData.id)
          .single();

        if (data && !error) {
          setStudentProfile(data);
        } else {
          // Fallback data
          const fallbackData = {
            id: '1',
            name: 'Priya Sharma',
            roll_number: 'AM.EN.U4CSE22051',
            year: 3,
            department_id: '1',
            bio: null,
            phone_number: null,
            department: { id: '1', name: 'Computer Science & Engineering', code: 'CSE' },
            user: { email: 'priya.sharma@amrita.edu', username: 'priya.sharma' }
          };
          setStudentProfile(fallbackData);
        }
      }
    } catch (error) {
      console.error('Failed to load student profile:', error);
      // Use fallback data
      const fallbackData = {
        id: '1',
        name: 'Priya Sharma',
        roll_number: 'AM.EN.U4CSE22051',
        year: 3,
        department_id: '1',
        bio: null,
        phone_number: null,
        department: { id: '1', name: 'Computer Science & Engineering', code: 'CSE' },
        user: { email: 'priya.sharma@amrita.edu', username: 'priya.sharma' }
      };
      setStudentProfile(fallbackData);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('profile');
    router.push('/auth/login');
  };

  const menuItems = [
    {
      icon: (
        <svg className="w-5 h-5 text-[#8B1538]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
      ),
      label: 'Home',
      href: '/dashboard/student'
    },
    {
      icon: (
        <svg className="w-5 h-5 text-[#8B1538]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      ),
      label: 'Profile',
      href: '/dashboard/student/profile'
    },
    {
      icon: (
        <svg className="w-5 h-5 text-[#8B1538]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z"/>
        </svg>
      ),
      label: 'My Projects',
      href: '/dashboard/student/projects'
    },
    {
      icon: (
        <svg className="w-5 h-5 text-[#8B1538]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/>
        </svg>
      ),
      label: 'Help & Support',
      href: '/dashboard/student/help'
    },
    {
      icon: (
        <svg className="w-5 h-5 text-[#8B1538]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A3.992 3.992 0 0 0 16 6.5c-1.09 0-2.04.44-2.75 1.13L10.5 10 16 22h4zM12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5zm-.5 1c-1.1 0-2 .9-2 2v7h4v-7c0-1.1-.9-2-2-2z"/>
        </svg>
      ),
      label: 'All Faculty',
      href: '/dashboard/student/faculty'
    }
  ];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}
      
      {/* Navigation Menu */}
      <div className={`fixed top-0 left-0 h-full w-80 bg-white z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        {/* Profile Header */}
        <div className="bg-[#8B1538] px-6 py-8 text-white">
          <div className="flex flex-col items-center">
            {/* Profile Photo */}
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1494790108755-2616b612b37c?w=80&h=80&fit=crop&crop=face" 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Profile Info */}
            <h2 className="text-lg font-bold text-center mb-1">
              {studentProfile?.name || 'Priya Sharma'}
            </h2>
            <p className="text-sm text-white/90 mb-1">
              Roll No: {studentProfile?.roll_number || 'AM.EN.U4CSE22051'}
            </p>
            <p className="text-sm text-white/90">
              Department: {studentProfile?.department?.code || 'CSE'}
            </p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="py-4">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              onClick={onClose}
              className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center space-x-4">
                {item.icon}
                <span className="text-gray-800 font-medium">{item.label}</span>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
          
          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors border-t border-gray-100 mt-4"
          >
            <div className="flex items-center space-x-4">
              <svg className="w-5 h-5 text-[#8B1538]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-gray-800 font-medium">Logout</span>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Version Footer */}
        <div className="absolute bottom-4 left-6 right-6">
          <p className="text-gray-400 text-sm text-center">Version 2.1.4</p>
        </div>
      </div>
    </>
  );
}