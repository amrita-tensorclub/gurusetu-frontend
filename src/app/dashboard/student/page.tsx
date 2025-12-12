'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function StudentDashboard() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    // Get user info from localStorage
    const userData = localStorage.getItem('user');
    const profileData = localStorage.getItem('profile');
    
    if (userData) {
      setUser(JSON.parse(userData));
    }
    if (profileData) {
      setProfile(JSON.parse(profileData));
    }
  }, []);

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#8B1538] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#2C3E50] text-white px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <span className="text-[#2C3E50] font-bold text-sm">G</span>
          </div>
          <span className="font-medium text-lg">Guru Setu</span>
        </div>
        <button className="p-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6">
        {/* Welcome Message */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Welcome back, {profile.name}! 👋
          </h1>
          <p className="text-gray-600 text-sm">
            Discover research opportunities and connect with faculty members.
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Your Profile
          </h2>
          
          <div className="space-y-4">
            <div>
              <span className="text-sm font-medium text-gray-500">Name:</span>
              <p className="text-gray-900 font-medium">{profile.name || 'milton'}</p>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-500">Roll Number:</span>
              <p className="text-gray-900">{profile.roll_number || ''}</p>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-500">Year:</span>
              <p className="text-gray-900">{profile.year || ''}</p>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-500">Department:</span>
              <p className="text-gray-900">{profile.departments?.name || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Quick Actions
          </h2>
          
          <div className="space-y-3">
            <Link 
              href="/dashboard/student/profile"
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div>
                <div className="font-medium text-gray-900">Update Profile</div>
                <div className="text-sm text-gray-500">Add skills, projects, and interests</div>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            
            <Link 
              href="/dashboard/student/faculty"
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div>
                <div className="font-medium text-gray-900">Explore Faculty</div>
                <div className="text-sm text-gray-500">Browse all faculty and their research</div>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            
            <Link 
              href="/dashboard/student/collaboration"
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div>
                <div className="font-medium text-gray-900">Find Projects</div>
                <div className="text-sm text-gray-500">Discover ongoing research projects</div>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}