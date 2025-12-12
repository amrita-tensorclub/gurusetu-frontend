'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function WelcomeStudent() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in and is a student
    const userData = localStorage.getItem('user');
    const userRole = localStorage.getItem('userRole');

    if (!userData || userRole !== 'student') {
      router.push('/login');
      return;
    }

    setUser(JSON.parse(userData));
    setIsLoading(false);

    // Auto-redirect to dashboard after 3 seconds
    const timer = setTimeout(() => {
      router.push('/dashboard/student');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  const handleContinue = () => {
    router.push('/dashboard/student');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#8B1538] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8B1538] to-[#6B1028] flex flex-col">
      {/* Header */}
      <div className="bg-white/10 h-16 flex items-center justify-center px-4">
        <h1 className="text-white text-lg font-medium">Guru Setu</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        {/* Welcome Animation Container */}
        <div className="relative mb-8">
          {/* Animated Circle */}
          <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <div className="w-24 h-24 bg-white/30 rounded-full flex items-center justify-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <span className="text-[#8B1538] font-bold text-2xl">G</span>
              </div>
            </div>
          </div>
        </div>

        {/* Welcome Text */}
        <div className="space-y-4 mb-12">
          <h1 className="text-4xl font-bold text-white">
            Welcome to Guru Setu!
          </h1>
          <p className="text-xl text-white/90 font-medium">
            Hello {user?.name || 'Student'}!
          </p>
          <p className="text-lg text-white/80 max-w-md mx-auto leading-relaxed">
            Your journey to discover amazing research opportunities and connect with faculty starts now.
          </p>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Smart Recommendations
            </h3>
            <p className="text-white/70 text-sm">
              Get AI-powered faculty suggestions based on your interests
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Campus Navigation
            </h3>
            <p className="text-white/70 text-sm">
              Never get lost finding faculty cabins again
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Research Projects
            </h3>
            <p className="text-white/70 text-sm">
              Discover exciting research opportunities across departments
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 w-full max-w-sm">
          <button
            onClick={handleContinue}
            className="w-full bg-white text-[#8B1538] py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
          >
            Continue to Dashboard
          </button>
          
          <p className="text-white/60 text-sm">
            Automatically redirecting in 3 seconds...
          </p>
        </div>

        {/* Bottom Decoration */}
        <div className="mt-8">
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}