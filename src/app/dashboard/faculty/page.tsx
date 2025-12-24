'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

export default function FacultyDashboard() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth('faculty');
  
  const [stats, setStats] = useState({
    pendingApplications: 0,
    activeProjects: 0,
    totalProjects: 0,
    profileComplete: false
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      if (!user) return;
      try {
        // Fetch Dashboard Data
        const data = await api.dashboard.faculty((user as any).id);
        
        if (data) {
          // Calculate stats from the response
          const projects = data.projects || [];
          const active = projects.filter((p: any) => p.status === 'open').length;
          
          // Count total pending applications across all projects
          // (Assuming the API returns application counts nested in projects, 
          // or we fetch applications separately. Let's fetch applications to be sure.)
          const appData = await api.faculty.getApplications((user as any).id);
          const pending = appData.applications?.filter((a: any) => a.status === 'pending').length || 0;

          // Check basic profile completeness
          const p = data.profile || {};
          const isComplete = !!(p.phone_number && p.office_hours && p.cabin_number);

          setStats({
            pendingApplications: pending,
            activeProjects: active,
            totalProjects: projects.length,
            profileComplete: isComplete
          });
        }
      } catch (error) {
        console.error('Dashboard load error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) loadDashboard();
  }, [user, authLoading]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#8B1538] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <header className="bg-[#8B1538] text-white px-6 py-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold leading-tight">Welcome, Dr. {user?.name}</h1>
              <p className="text-xs text-white/80">Faculty Dashboard</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Alerts Section */}
        {!stats.profileComplete && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 rounded-r-lg flex justify-between items-center">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              <div>
                <p className="font-bold text-yellow-800">Complete your profile</p>
                <p className="text-sm text-yellow-700">Add your cabin location and office hours so students can find you.</p>
              </div>
            </div>
            <Link 
              href="/dashboard/faculty/profile"
              className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded hover:bg-yellow-200 transition-colors text-sm font-bold"
            >
              Edit Profile
            </Link>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Applications Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            <h3 className="text-gray-500 font-medium relative z-10">Pending Applications</h3>
            <p className="text-4xl font-bold text-gray-800 mt-2 relative z-10">{stats.pendingApplications}</p>
            <div className="mt-4 relative z-10">
              <Link href="/dashboard/faculty/applications" className="text-blue-600 font-semibold text-sm hover:underline flex items-center gap-1">
                Review Now <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
              </Link>
            </div>
          </div>

          {/* Active Projects Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            <h3 className="text-gray-500 font-medium relative z-10">Active Openings</h3>
            <p className="text-4xl font-bold text-gray-800 mt-2 relative z-10">{stats.activeProjects}</p>
            <div className="mt-4 relative z-10">
              <Link href="/dashboard/faculty/projects" className="text-green-600 font-semibold text-sm hover:underline flex items-center gap-1">
                Manage Projects <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
              </Link>
            </div>
          </div>

          {/* Research Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            <h3 className="text-gray-500 font-medium relative z-10">Total Projects Listed</h3>
            <p className="text-4xl font-bold text-gray-800 mt-2 relative z-10">{stats.totalProjects}</p>
            <div className="mt-4 relative z-10">
              <Link href="/dashboard/faculty/research" className="text-purple-600 font-semibold text-sm hover:underline flex items-center gap-1">
                Update Portfolio <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
              </Link>
            </div>
          </div>

        </div>

        {/* Quick Actions Grid */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <Link href="/dashboard/faculty/projects" className="bg-white p-4 rounded-lg shadow-sm border hover:border-[#8B1538] hover:shadow-md transition-all flex flex-col items-center text-center group">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-[#8B1538] mb-3 group-hover:bg-[#8B1538] group-hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
            </div>
            <span className="font-semibold text-gray-700">Post New Opening</span>
          </Link>

          <Link href="/dashboard/faculty/applications" className="bg-white p-4 rounded-lg shadow-sm border hover:border-blue-500 hover:shadow-md transition-all flex flex-col items-center text-center group">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <span className="font-semibold text-gray-700">Review Applications</span>
          </Link>

          <Link href="/dashboard/faculty/profile" className="bg-white p-4 rounded-lg shadow-sm border hover:border-yellow-500 hover:shadow-md transition-all flex flex-col items-center text-center group">
            <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-600 mb-3 group-hover:bg-yellow-600 group-hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            </div>
            <span className="font-semibold text-gray-700">Update Profile</span>
          </Link>

          <Link href="/dashboard/faculty/research" className="bg-white p-4 rounded-lg shadow-sm border hover:border-purple-500 hover:shadow-md transition-all flex flex-col items-center text-center group">
            <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 mb-3 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
            </div>
            <span className="font-semibold text-gray-700">My Research</span>
          </Link>

        </div>

      </main>
    </div>
  );
}