"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ChevronRight } from 'lucide-react';
import { authService } from '@/services/authService';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';

// Helper to decode JWT
function parseJwt(token: string) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<'student' | 'faculty'>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      localStorage.removeItem('user');
      localStorage.removeItem('token');

      const response = await authService.login(email, password);

      let userId = response.user_id; 
      if (!userId && response.access_token) {
          const decoded = parseJwt(response.access_token);
          if (decoded) {
              userId = decoded.user_id || decoded.sub || decoded.id;
          }
      }

      if (!userId) {
          throw new Error("Could not find User ID in login response.");
      }

      const userData = {
          user_id: userId,
          role: role,
          access_token: response.access_token
      };
      
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", response.access_token);

      toast.success(`Welcome back!`);
      
      if (role === 'student') {
        router.push('/dashboard/student');
      } else {
        router.push('/dashboard/faculty');
      }
      
    } catch (err: any) {
      console.error("Login Error:", err);
      toast.error('Login Failed: ' + (err.message || "Server Error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    // --- MAIN CONTAINER (Full Screen Mobile) ---
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Toaster position="top-center" />
      
        {/* Branding Section */}
        <div className="bg-white pt-20 pb-4 px-6 text-center space-y-1">
          <h1 className="text-4xl font-black text-[#8C1515] tracking-tight">Guru Setu</h1>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest leading-relaxed">
            Connecting Students & Faculty <br/> for Research Excellence
          </p>
        </div>

        {/* Role Switcher */}
        <div className="px-8 mt-6 max-w-md mx-auto w-full">
          <div className="flex bg-gray-100 p-1 rounded-full shadow-inner">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`flex-1 py-3 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
                role === 'student' ? 'bg-[#8C1515] text-white shadow-md' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => setRole('faculty')}
              className={`flex-1 py-3 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
                role === 'faculty' ? 'bg-[#8C1515] text-white shadow-md' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Faculty
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="px-8 space-y-6 mt-10 max-w-md mx-auto w-full">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="relative">
              <input 
                type="email" 
                placeholder="University Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-2 border-[#8C1515] rounded-2xl p-4 text-sm font-bold text-gray-700 outline-none focus:bg-gray-50 transition-colors"
                required
              />
            </div>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-2 border-[#8C1515] rounded-2xl p-4 text-sm font-bold text-gray-700 outline-none focus:bg-gray-50 transition-colors"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8C1515]"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="relative pt-4">
              <button 
                disabled={loading}
                className="w-full bg-[#8C1515] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl active:scale-95 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {loading ? 'Verifying...' : `LOGIN AS ${role === 'student' ? 'STUDENT' : 'FACULTY'}`}
                {!loading && (
                    <div className="w-6 h-6 bg-[#D4AF37] rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                        <ChevronRight color="white" size={16} strokeWidth={3} />
                    </div>
                )}
              </button>
            </div>
          </form>

          {/* Footer Links */}
          <div className="text-center mt-8 pb-10">
            <p className="text-xs font-bold text-gray-400">New to Guru Setu?</p>
            <Link href="/signup" className="text-sm font-bold text-[#8C1515] hover:underline">
              Create Account
            </Link>
          </div>
        </div>
    </div>
  );
}