'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'student' | 'faculty'>('student');
  const [emailOrRoll, setEmailOrRoll] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailOrRoll,
          password,
          role: activeTab
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      // Store user info
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('profile', JSON.stringify(data.profile));
      localStorage.setItem('userRole', activeTab);
      
      // Redirect to welcome page
      if (activeTab === 'student') {
        router.push('/welcome/student');
      } else {
        router.push('/welcome/faculty');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-[#8B1538] h-5 flex items-center justify-center px-2">
        {/* <h1 className="text-white text-lg font-medium">Guru Setu</h1> */}
      </div>

      {/* Main Content */}
      <div className="flex-1 px-8 pt-12 pb-8">
        {/* Logo and Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#8B1538] mb-2">Guru Setu</h1>
          <p className="text-gray-700 text-sm px-4 leading-relaxed">
            Connecting Students & Faculty<br />
            for Research Excellence
          </p>
        </div>

        {/* University Buildings Illustration */}
        <div className="flex justify-center mb-12">
          <svg width="300" height="80" viewBox="0 0 300 80" className="text-gray-300">
            {/* Simple building illustration */}
            <g stroke="currentColor" strokeWidth="1" fill="none">
              {/* Building 1 */}
              <rect x="10" y="30" width="25" height="40" />
              <rect x="15" y="35" width="4" height="4" />
              <rect x="25" y="35" width="4" height="4" />
              <rect x="15" y="45" width="4" height="4" />
              <rect x="25" y="45" width="4" height="4" />
              
              {/* Building 2 */}
              <rect x="45" y="20" width="30" height="50" />
              <rect x="50" y="25" width="4" height="4" />
              <rect x="60" y="25" width="4" height="4" />
              <rect x="70" y="25" width="4" height="4" />
              <rect x="50" y="35" width="4" height="4" />
              <rect x="60" y="35" width="4" height="4" />
              <rect x="70" y="35" width="4" height="4" />
              
              {/* Tree */}
              <circle cx="90" cy="55" r="8" />
              <rect x="88" y="55" width="4" height="15" />
              
              {/* Building 3 */}
              <rect x="110" y="25" width="35" height="45" />
              <rect x="115" y="30" width="4" height="4" />
              <rect x="125" y="30" width="4" height="4" />
              <rect x="135" y="30" width="4" height="4" />
              <rect x="115" y="40" width="4" height="4" />
              <rect x="125" y="40" width="4" height="4" />
              <rect x="135" y="40" width="4" height="4" />
              
              {/* More buildings */}
              <rect x="155" y="35" width="20" height="35" />
              <rect x="185" y="30" width="25" height="40" />
              <rect x="220" y="25" width="30" height="45" />
              <rect x="260" y="40" width="20" height="30" />
            </g>
          </svg>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email/Roll Number Input */}
          <div>
            <input
              type="text"
              placeholder="Email / Roll Number"
              value={emailOrRoll}
              onChange={(e) => setEmailOrRoll(e.target.value)}
              className="w-full px-4 py-4 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 text-lg focus:outline-none focus:ring-2 focus:ring-[#8B1538] focus:border-transparent"
              required
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-4 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 text-lg focus:outline-none focus:ring-2 focus:ring-[#8B1538] focus:border-transparent pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          {/* Login Button */}
          <div className="relative">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#8B1538] text-white py-4 rounded-lg text-lg font-semibold hover:bg-[#7A1230] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  LOGIN
                  <div className="absolute right-4 w-8 h-8 bg-[#D4AF37] rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </>
              )}
            </button>
          </div>

          {/* Forgot Password and Signup */}
          <div className="text-center space-y-3">
            <a href="/forgot-password" className="block text-gray-600 text-sm hover:text-[#8B1538] transition-colors underline">
              Forgot Password?
            </a>
            <p className="text-gray-600 text-sm">
              Don't have an account?{' '}
              <Link href="/" className="text-[#8B1538] font-medium hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </form>

        {/* Role Toggle Buttons */}
        <div className="flex mt-12 space-x-1">
          <button
            onClick={() => setActiveTab('student')}
            className={`flex-1 py-3 px-6 rounded-full text-sm font-medium transition-colors ${
              activeTab === 'student'
                ? 'bg-[#8B1538] text-white'
                : 'bg-[#D4AF37] text-white hover:bg-[#B8941F]'
            }`}
          >
            Student Login
          </button>
          <button
            onClick={() => setActiveTab('faculty')}
            className={`flex-1 py-3 px-6 rounded-full text-sm font-medium transition-colors ${
              activeTab === 'faculty'
                ? 'bg-[#8B1538] text-white'
                : 'bg-[#D4AF37] text-white hover:bg-[#B8941F]'
            }`}
          >
            Faculty Login
          </button>
        </div>

        {/* Bottom Text */}
        <div className="text-center mt-16 space-y-4">
          <div className="text-gray-500 text-sm">
            Powered by <span className="font-medium">[Institution Name]</span>
          </div>
          <div className="text-gray-600 text-sm">
            Don't have an account?{' '}
            <Link href="/signup" className="text-[#8B1538] font-medium hover:underline">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}