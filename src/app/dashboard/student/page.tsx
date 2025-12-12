'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {profile.name}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Discover research opportunities and connect with faculty members.
        </p>
      </div>

      {/* Profile Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Your Profile
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Name:</span>
                <p className="text-gray-900 dark:text-white">{profile.name}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Roll Number:</span>
                <p className="text-gray-900 dark:text-white">{profile.roll_number}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Year:</span>
                <p className="text-gray-900 dark:text-white">{profile.year}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Department:</span>
                <p className="text-gray-900 dark:text-white">
                  {profile.departments?.name || 'N/A'}
                </p>
              </div>
              {profile.area_of_interest && (
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Interests:</span>
                  <p className="text-gray-900 dark:text-white">{profile.area_of_interest}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Quick Actions
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link 
                href="/dashboard/student/profile"
                className="block p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white">Update Profile</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Add skills, projects, and interests
                </div>
              </Link>
              
              <Link 
                href="/dashboard/student/faculty"
                className="block p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white">Explore Faculty</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Browse all faculty and their research
                </div>
              </Link>
              
              <Link 
                href="/dashboard/student/collaboration"
                className="block p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white">Find Projects</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Discover ongoing research projects
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Welcome Message */}
      <Card>
        <CardContent className="py-8 text-center">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Welcome to Guru Setu! 🎓
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            You're now connected to a world of research opportunities. Explore faculty profiles, 
            discover projects that match your interests, and start your journey toward academic excellence.
          </p>
          <div className="mt-6">
            <Link href="/dashboard/student/faculty">
              <button className="bg-[#8B1538] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#7A1230] transition-colors">
                Start Exploring
              </button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}